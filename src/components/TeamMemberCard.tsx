import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface TeamMemberCardProps {
  name: string;
  title: string;
  image: string;
}

const TeamMemberCard = ({ name, title, image }: TeamMemberCardProps) => {
  return (
    <Card className="group relative overflow-hidden border-border hover:shadow-hover transition-smooth cursor-pointer h-96">
      <img 
        src={image} 
        alt={name}
        className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-smooth" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-primary-foreground">
        <h3 className="text-2xl font-bold mb-1">{name}</h3>
        <p className="text-primary-foreground/90 mb-4">{title}</p>
        <Button 
          variant="hero" 
          size="sm"
          className="opacity-0 group-hover:opacity-100 transition-smooth"
        >
          View Bio
        </Button>
      </div>
    </Card>
  );
};

export default TeamMemberCard;
