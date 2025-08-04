interface PageHeaderProps {
  title: string
  subtitle?: string
  icon?: React.ReactNode
  gradient?: 'blue' | 'green' | 'purple'
}

export default function PageHeader({ 
  title, 
  subtitle, 
  icon, 
  gradient = 'blue' 
}: PageHeaderProps) {
  const gradientClasses = {
    blue: 'bg-gradient-to-r from-blue-600 to-purple-700',
    green: 'bg-gradient-to-r from-green-600 to-teal-700',
    purple: 'bg-gradient-to-r from-purple-600 to-pink-700'
  }

  return (
    <div className={`${gradientClasses[gradient]} text-white rounded-xl p-8 mb-8`}>
      <div className="flex items-center mb-4">
        {icon && (
          <div className="bg-white/20 rounded-lg p-2 mr-4">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-blue-100 text-lg">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}