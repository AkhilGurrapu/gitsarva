import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ArrowRight } from "lucide-react";

interface InstructionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: string;
  steps?: string[];
  onNext?: () => void;
}

export default function InstructionModal({ 
  isOpen, 
  onClose, 
  title, 
  content, 
  steps = [],
  onNext 
}: InstructionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else if (onNext) {
      onNext();
      onClose();
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-github-dark dark:text-foreground">
            {title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-muted-foreground">
            {content}
          </p>
          
          {steps.length > 0 && (
            <Card className="bg-github-bg dark:bg-muted">
              <CardContent className="p-4">
                <h4 className="font-medium text-github-dark dark:text-foreground mb-2">
                  {steps.length > 1 ? `Step ${currentStep + 1} of ${steps.length}:` : 'Next Steps:'}
                </h4>
                <div className="space-y-2">
                  {steps.length === 1 ? (
                    <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                      {steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {steps[currentStep]}
                    </div>
                  )}
                </div>
                
                {steps.length > 1 && (
                  <div className="flex items-center mt-3 space-x-1">
                    {steps.map((_, index) => (
                      <div
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index <= currentStep ? 'bg-github-blue' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
          
          <div className="flex justify-end space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Skip
            </Button>
            <Button 
              onClick={handleNext}
              className="bg-github-blue hover:bg-github-blue/90 text-white"
            >
              {currentStep < steps.length - 1 ? (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  Continue
                  <CheckCircle className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
