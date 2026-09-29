import {favorites, preferences, savedSearch} from './preferences.mjs';
// Inject a configured Supabase client. No credentials or production endpoints here.
export function buyerAccount(client) {
  async function user() {
    const {data,error}=await client.auth.getUser();
    if(error || !data?.user?.id || !data.user.email_confirmed_at) throw new Error('Verify your email and sign in first.');
    return data.user;
  }
  async function result(query,message) {const {data,error}=await query;if(error)throw new Error(message);return data;}
  return {
    async requestSignIn(email) {
      if(typeof email!=='string'||email.length>254||!/^\S+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new Error('Enter a valid email address.');
      await result(client.auth.signInWithOtp({email:email.trim(),options:{emailRedirectTo:'https://www.bircabo.com/buyer-account.html'}}),'The sign-in email could not be sent. Please try again.');
    },
    async importFavorites(local) {
      const rows=favorites(local),u=await user();
      if(!rows.length)return;
      await result(client.from('bir_buyer_favorites').upsert(rows.map(p=>({...p,user_id:u.id})),{onConflict:'user_id,listing_key',ignoreDuplicates:true}),'Could not sync favorites. Your browser copy has been kept.');
    },
    async listFavorites() {const u=await user();return result(client.from('bir_buyer_favorites').select('listing_key,mls_number').eq('user_id',u.id),'Could not load saved properties.');},
    async removeFavorite(key) {favorites([{key,mls:''}]);const u=await user();await result(client.from('bir_buyer_favorites').delete().eq('user_id',u.id).eq('listing_key',key),'Could not remove saved property.');},
    async addSearch(name,filters) {const search=savedSearch(name,filters),u=await user();return result(client.from('bir_buyer_searches').insert({...search,user_id:u.id}).select('id,name,filters').single(),'Could not save this search.');},
    async listSearches() {const u=await user();return result(client.from('bir_buyer_searches').select('id,name,filters').eq('user_id',u.id),'Could not load saved searches.');},
    async removeSearch(id) {const u=await user();await result(client.from('bir_buyer_searches').delete().eq('user_id',u.id).eq('id',id),'Could not remove this search.');},
    async setPreferences(input) {
      const p=preferences(input);await user();
      // RPC stamps consent on the server, increments the revision, and resets the baseline.
      return result(client.rpc('bir_set_alert_preferences',{p_frequency:p.frequency,p_new_matches:p.new_matches,p_favorite_changes:p.favorite_changes}),'Could not save email preferences.');
    },
    async getPreferences() {const u=await user();return result(client.from('bir_buyer_preferences').select('frequency,new_matches,favorite_changes,revision').eq('user_id',u.id).maybeSingle(),'Could not load email preferences.');},
    async signOut() {await result(client.auth.signOut({scope:'local'}),'Could not finish signing out.');}
  };
}
