import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface TrainerContact {
  email: string | null;
  phone: string | null;
}

export function useTrainerContact() {
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState<TrainerContact | null>(null);
  const { toast } = useToast();

  const fetchContact = async (trainerId: string) => {
    setIsLoading(true);
    setContact(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-trainer-contact', {
        body: { trainer_id: trainerId }
      });

      if (error) {
        console.error('Error fetching trainer contact:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch trainer contact information',
          variant: 'destructive'
        });
        return null;
      }

      if (data.error) {
        toast({
          title: 'Access Denied',
          description: data.error,
          variant: 'destructive'
        });
        return null;
      }

      setContact(data);
      return data;
    } catch (err) {
      console.error('Error:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearContact = () => {
    setContact(null);
  };

  return { contact, isLoading, fetchContact, clearContact };
}
