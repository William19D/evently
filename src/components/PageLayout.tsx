import React from 'react';
import Navigation from './Navigation';
import Breadcrumb from './Breadcrumb';

interface PageLayoutProps {
  children: React.ReactNode;
  showBreadcrumb?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    isActive?: boolean;
  }>;
  className?: string;
  headerContent?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showBreadcrumb = true,
  breadcrumbItems,
  className = "",
  headerContent
}) => {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 ${className}`}>
      <Navigation />
      
      {showBreadcrumb && (
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Breadcrumb items={breadcrumbItems} />
            {headerContent && (
              <div className="mt-3">
                {headerContent}
              </div>
            )}
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </div>
    </div>
  );
};

export default PageLayout;