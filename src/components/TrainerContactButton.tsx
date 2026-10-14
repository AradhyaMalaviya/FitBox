import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useTrainerContact } from '@/hooks/useTrainerContact';
import { Eye, Mail, Phone, Loader2, Shield } from 'lucide-react';

interface TrainerContactButtonProps {
  trainerId: string;
  trainerName?: string;
}

export function TrainerContactButton({ trainerId, trainerName }: TrainerContactButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { contact, isLoading, fetchContact, clearContact } = useTrainerContact();

  const handleClick = async () => {
    setIsOpen(true);
    if (!contact) {
      await fetchContact(trainerId);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    clearContact();
  };

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleClick}
        className="gap-2"
      >
        <Eye className="h-4 w-4" />
        View Contact Info
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {trainerName ? `${trainerName}'s Contact` : 'Trainer Contact'}
            </DialogTitle>
            <DialogDescription>
              This access has been logged for security purposes.
            </DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : contact ? (
            <div className="space-y-4 py-4">
              {contact.email && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <a 
                      href={`tel:${contact.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </div>
              )}
              {!contact.email && !contact.phone && (
                <p className="text-center text-muted-foreground py-4">
                  No contact information available.
                </p>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Unable to load contact information.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
