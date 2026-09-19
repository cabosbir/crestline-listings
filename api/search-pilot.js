import {createHmac, timingSafeEqual} from 'node:crypto';

export const fields = ['ListingKey','ListingId','UnparsedAddress','City','MLSAreaMajor','Address_co_Community2','SubdivisionName','PropertyType','StandardStatus','ListPrice','BedroomsTotal','BathroomsTotalDecimal','BathroomsFull','Latitude','Longitude','General_sp_Description_co_AC_sp_SqFt','General_sp_Description_co_Primary_sp_View','General_sp_Description_co_Seller_sp_Financing_sp_Offered','ListOfficeName','PublicRemarks','InternetAddressDisplayYN','InternetEntireListingDisplayYN','ModificationTimestamp'];
const sign = (value, key) => createHmac('sha256', key).update(value).digest('base64url');
const communityFields=['Address_co_Community2','General_sp_Description_co_Community3','Location_sp_Taxes_sp_Legal_co_Community4'];
export function buildRequest(endpoint, query) {
  const url=new URL(endpoint), light=query.mode==='inventory';
  const gallery=query.mode==='gallery';
  if(gallery&&(typeof query.keys!=='string'||!/^\d{1,40}$/.test(query.keys)))throw new Error('Gallery requires one listing');
  let filter="StandardStatus eq 'Active' and InternetEntireListingDisplayYN ne false";
  if(query.group!==undefined){
    if(!light)throw new Error('Invalid group');
    const groups={budget:'ListPrice lt 250000',mid:'ListPrice ge 250000 and ListPrice lt 500000',upper:'ListPrice ge 500000 and ListPrice lt 1000000',other:'ListPrice ge 1000000 or ListPrice eq null'};
    if(!Object.hasOwn(groups,query.group))throw new Error('Invalid group');
    filter+=` and (${groups[query.group]})`;
  }
  if(query.keys!==undefined){
    if(typeof query.keys!=='string')throw new Error('Invalid keys');
    const keys=query.keys.split(',');
    if(!keys.length||keys.length>24||keys.some(k=>!/^\d{1,40}$/.test(k)))throw new Error('Invalid keys');
    filter+=` and (${keys.map(k=>`ListingKey eq '${k}'`).join(' or ')})`;
  }
  url.searchParams.set('$filter',filter);
  url.searchParams.set('$select',[...(light?fields.filter(k=>k!=='PublicRemarks'):fields),...communityFields.slice(1)].join(','));
  if(!light)url.searchParams.set('$expand',gallery?'Media':'Media($top=1)');
  url.searchParams.set('$top',light?'1000':gallery?'1':'24');
  url.searchParams.set('$count','true');
  url.searchParams.set('$orderby',light?'ListingKey asc':'ModificationTimestamp desc');
  return url;
}
export function encodeCursor(url, key, expires = Date.now()+15*60*1000) {
  const body=Buffer.from(JSON.stringify({url,expires})).toString('base64url');
  return `${body}.${sign(body,key)}`;
}
export function decodeCursor(cursor, key, endpoint) {
  if(typeof cursor!=='string'||cursor.length>12000)throw new Error('Invalid cursor');
  const [body,signature,...extra]=cursor.split('.');
  const expected=Buffer.from(sign(body||'',key)), supplied=Buffer.from(signature||'');
  if(extra.length||expected.length!==supplied.length||!timingSafeEqual(expected,supplied))throw new Error('Invalid cursor');
  const data=JSON.parse(Buffer.from(body,'base64url').toString());
  const url=new URL(data.url), base=new URL(endpoint);
  if(!Number.isFinite(data.expires)||data.expires<Date.now()||url.origin!==base.origin||url.pathname!==base.pathname||url.username||url.password)throw new Error('Invalid cursor');
  return url;
}
export function publicListing(row,fullPhotos=false) {
  if(row.StandardStatus!=='Active'||row.InternetEntireListingDisplayYN===false)return null;
  const result=Object.fromEntries(fields.filter(k=>k in row).map(k=>[k,row[k]]));
  result.Address_co_Community2=communityFields.map(k=>row[k]).find(v=>typeof v==='string'&&v.trim()&&!/^\*+$/.test(v))||null;
  if(row.InternetAddressDisplayYN===false){
    result.UnparsedAddress='Address available on request';
    result.Latitude=null;result.Longitude=null;
  }
  const photos=Array.isArray(row.Media)?row.Media.filter(m=>(!m.MediaCategory||m.MediaCategory==='Photo')&&(!m.Permission||(Array.isArray(m.Permission)?m.Permission.includes('Public'):m.Permission==='Public'))&&typeof m.MediaURL==='string'&&m.MediaURL.startsWith('https://')).sort((a,b)=>(Number(a.Order)||0)-(Number(b.Order)||0)):[];
  result.Media=(fullPhotos?photos:photos.slice(0,1)).map(m=>({MediaURL:m.MediaURL,caption:typeof m.ShortDescription==='string'?m.ShortDescription:''}));
  return result;
}
export default async function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  if(req.method==='POST')return handleInquiry(req,res);
  if(req.method!=='GET'){res.setHeader('Allow','GET, POST');return res.status(405).json({error:'Method not allowed'});}
  if(req.query.mode==='email-check'){
    if(process.env.VERCEL_ENV!=='preview')return res.status(404).json({error:'Not found'});
    let transport;
    try{transport=await mailTransport();await transport.verify();return res.status(200).json({status:'connected',message:'The email server accepted the configured login. No message was sent.'});}
    catch(error){return res.status(200).json({status:mailErrorCode(error),message:'The email connection check failed. No message was sent.'});}
    finally{transport?.close();}
  }
  const key=process.env.FLEXMLS_API_KEY, base=process.env.FLEXMLS_BASE_URL;
  if(!key||!base)return res.status(503).json({error:'The preview listing connection is not configured.'});
  let endpoint,url;
  try {
    endpoint=new URL(`${base.replace(/\/$/,'')}/Property`);
    if(endpoint.protocol!=='https:')throw new Error('Invalid endpoint');
    if(req.query.cursor)url=decodeCursor(req.query.cursor,key,endpoint);
    else url=buildRequest(endpoint,req.query);
  } catch {return res.status(400).json({error:'This inventory request has expired or is invalid. Reload to start again.'});}
  try {
    const response=await fetch(url,{headers:{Authorization:`Bearer ${key}`,Accept:'application/json'},signal:AbortSignal.timeout(24000),redirect:'error'});
    if(!response.ok)return res.status(response.status===429?429:502).json({error:`The listing provider could not complete this page (status ${response.status}). Reload to retry.`});
    const data=await response.json();
    if(!Array.isArray(data.value))throw new Error('Invalid provider response');
    if(req.query.mode==='gallery'&&data.value.some(row=>row['Media@odata.nextLink']))throw new Error('Incomplete photo gallery');
    let next=null;
    if(data['@odata.nextLink']){
      const nextURL=new URL(data['@odata.nextLink'],endpoint);
      if(nextURL.origin!==endpoint.origin||nextURL.pathname!==endpoint.pathname||nextURL.username||nextURL.password)throw new Error('Invalid provider continuation');
      next=encodeCursor(nextURL.toString(),key);
    }
    const total=Number(data['@odata.count']);
    return res.status(200).json({results:data.value.map(row=>publicListing(row,req.query.mode==='gallery')).filter(Boolean),received:data.value.length,total:Number.isSafeInteger(total)&&total>=0?total:null,next,fetchedAt:new Date().toISOString()});
  } catch {return res.status(502).json({error:'The listing provider did not finish this page. Reload to retry; partial inventory is not shown as complete.'});}
}

export function inquiryMessage(body,from){
  if(!body||typeof body!=='object'||Array.isArray(body))throw new Error('Invalid form');
  const limits={name:100,email:254,phone:50,message:3000,listingId:40,address:300};
  const values={};
  for(const [field,max] of Object.entries(limits)){
    const value=body[field]??'';
    if(typeof value!=='string'||value.length>max)throw new Error('Please shorten the form fields.');
    values[field]=value.trim();
  }
  if(!values.name||!values.message||!/^\S+@[^\s@]+\.[^\s@]+$/.test(values.email)||/[\r\n]/.test(values.email)||!/^\d{2}-\d{1,10}$/.test(values.listingId))throw new Error('Please provide your name, a valid email, and a question.');
  return {from,to:'don@bircabo.com',replyTo:values.email,subject:`BIR property inquiry - MLS ${values.listingId}`,text:`New property inquiry from the BIR search preview\n\nName: ${values.name}\nEmail: ${values.email}\nPhone: ${values.phone||'Not provided'}\nMLS: ${values.listingId}\nProperty: ${values.address}\n\n${values.message}\n\nProperty reference supplied by the visitor; confirm current availability in FLEX.`};
}
async function mailTransport(){
  const {default:nodemailer}=await import('nodemailer');
  return nodemailer.createTransport({service:'gmail',auth:{user:process.env.OFFICE_EMAIL,pass:process.env.OFFICE_APP_PASSWORD},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
}
export function mailErrorCode(error){
  return ['EAUTH','ECONNECTION','ETIMEDOUT','ESOCKET','EDNS','EENVELOPE','EMESSAGE','ERR_MODULE_NOT_FOUND'].includes(error?.code)?error.code:'EMAIL_SERVICE_ERROR';
}
async function deliverInquiry(message){
  const transport=await mailTransport();
  try {const result=await transport.sendMail(message);if(!result.accepted?.some(address=>String(address).toLowerCase()==='don@bircabo.com'))throw new Error('Not accepted');}
  finally {transport.close();}
}
// Preview-only abuse protection. A shared rate limiter is required before public launch.
const inquiryLimits=new Map();
export async function handleInquiry(req,res,send=deliverInquiry){
  let origin;
  try{origin=new URL(req.headers.origin);}catch{return res.status(403).json({error:'Please send your inquiry from the website.'});}
  if(origin.host!==req.headers.host||origin.protocol!=='https:')return res.status(403).json({error:'Please send your inquiry from the website.'});
  if(!String(req.headers['content-type']||'').startsWith('application/json'))return res.status(415).json({error:'Invalid form format.'});
  if(Number(req.headers['content-length']||0)>16000)return res.status(413).json({error:'Please shorten your question.'});
  if(req.body?.website)return res.status(400).json({error:'Please reload the form and try again.'});
  if(!process.env.OFFICE_EMAIL||!process.env.OFFICE_APP_PASSWORD)return res.status(503).json({error:'Online inquiries are not configured yet. Please use the email or call link below.'});
  let message;
  try{message=inquiryMessage(req.body,process.env.OFFICE_EMAIL);}catch(error){return res.status(400).json({error:error.message});}
  const now=Date.now(),ip=String(req.headers['x-forwarded-for']||'unknown').split(',')[0];
  for(const [id,value] of inquiryLimits)if(value.expires<now)inquiryLimits.delete(id);
  const bucket=inquiryLimits.get(ip)||{count:0,expires:now+600000};
  if(bucket.count>=5||inquiryLimits.size>1000)return res.status(429).json({error:'Too many attempts. Please wait a few minutes or use the email link.'});
  bucket.count++;inquiryLimits.set(ip,bucket);
  try{await send(message);return res.status(200).json({success:true});}
  catch(error){console.error('Preview inquiry failed:',mailErrorCode(error));return res.status(502).json({error:'We could not confirm your inquiry was sent. Please contact Don using the email or call link below.'});}
}
