import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, X, Star, Target, Award } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: 'trophy' | 'star' | 'target' | 'award';
}

interface ProgressToastProps {
  achievement: Achievement | null;
  onClose: () => void;
}

const iconMap = {
  trophy: Trophy,
  star: Star,
  target: Target,
  award: Award,
};

export default function ProgressToast({ achievement, onClose }: ProgressToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (achievement) {
      setIsVisible(true);
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [achievement]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!achievement) return null;

  const IconComponent = iconMap[achievement.icon];

  return (
    <div 
      className={`fixed top-20 right-4 z-50 transform transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <Card className="bg-success-green text-white shadow-lg border-success-green w-80">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <IconComponent className="h-8 w-8 text-yellow-300" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-lg">Achievement Unlocked!</div>
              <div className="text-sm opacity-90 font-medium">{achievement.title}</div>
              <div className="text-xs opacity-75 mt-1">{achievement.description}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:text-white hover:bg-white/20 p-1"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
