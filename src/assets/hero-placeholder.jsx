import React from 'react'
import { Brain, Zap, Target } from 'lucide-react'

const HeroPlaceholder = () => {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-lg p-8 flex items-center justify-center text-white">
      <div className="text-center">
        <div className="flex justify-center gap-4 mb-4">
          <Brain className="w-12 h-12 opacity-80" />
          <Zap className="w-12 h-12 opacity-60" />
          <Target className="w-12 h-12 opacity-80" />
        </div>
        <h3 className="text-2xl font-bold mb-2">AI Fundamentals</h3>
        <p className="text-blue-100">For Business Leaders</p>
      </div>
    </div>
  )
}

export default HeroPlaceholder