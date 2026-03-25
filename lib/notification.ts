import { toast } from '@/hooks/use-toast';

type ToastVariant = 'default' | 'destructive';

interface NotificationOptions {
  title?: string;
  description: string;
  duration?: number;
  variant?: ToastVariant;
}

class NotificationService {
  private isDev = process.env.NODE_ENV === 'development';

  private show(options: NotificationOptions, error?: unknown) {
    toast({
      title: options.title || this.getDefaultTitle(options.variant),
      description: options.description,
      variant: options.variant || 'default',
      duration: options.duration || this.getDefaultDuration(options.variant),
    });
  }

  private getDefaultTitle(variant?: ToastVariant): string {
    return variant === 'destructive' ? 'Erro' : 'Sucesso';
  }

  private getDefaultDuration(variant?: ToastVariant): number {
    return variant === 'destructive' ? 8000 : 4000;
  }

  error(description: string, error?: unknown, title?: string) {
    this.show({
      title,
      description,
      variant: 'destructive'
    }, error);
  }

  success(description: string, title?: string) {
    this.show({
      title,
      description,
      variant: 'default'
    });
  }

  warning(description: string, title?: string) {
    this.show({
      title,
      description,
      variant: 'destructive'
    });
  }

  info(description: string, title?: string) {
    this.show({
      title,
      description,
      variant: 'default'
    });
  }
}

export const notification = new NotificationService();
