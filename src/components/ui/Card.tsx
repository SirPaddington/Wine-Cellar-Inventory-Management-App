import React from 'react';
import clsx from 'clsx';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
    return (
        <div className={clsx('bg-slate-900 border border-slate-800 rounded-xl shadow-sm', className)} {...props}>
            {children}
        </div>
    );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={clsx('px-6 py-4 border-b border-slate-800', className)} {...props}>{children}</div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, children, ...props }) => (
    <h3 className={clsx('text-lg font-semibold text-slate-100', className)} {...props}>{children}</h3>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div className={clsx('p-6', className)} {...props}>{children}</div>
);
