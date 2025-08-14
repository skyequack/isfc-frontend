interface AnalyticsCardProps {
  title: string
  value: string | number
  trend: 'up' | 'down' | 'neutral'
  trendValue?: string
  icon?: string
  color: 'orange' | 'green' | 'blue' | 'red' | 'purple'
}

export default function AnalyticsCard({ title, value, trend, trendValue, icon }: AnalyticsCardProps) {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-lg bg-accent text-white">
              <span className="text-xl">{icon}</span>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-300">{title}</p>
              <p className="text-2xl font-bold text-white">{value}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-success">
            <span className="text-green-500">
              {trend === 'up' ? '↗️' : trend === 'down' ? '↘️' : '➡️'}
            </span>
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
