interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white shadow-lg rounded-lg p-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
}

export function CardHeader({ title, subtitle }: CardHeaderProps) {
  return (
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
    </div>
  );
}

interface CardContentProps {
  children: React.ReactNode;
}

export function CardContent({ children }: CardContentProps) {
  return <div className="space-y-4">{children}</div>;
}

interface CardFooterProps {
  children: React.ReactNode;
}

export function CardFooter({ children }: CardFooterProps) {
  return <div className="mt-4 flex justify-end space-x-2">{children}</div>;
}
