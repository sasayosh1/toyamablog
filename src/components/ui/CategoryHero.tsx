import React from 'react'

interface CategoryHeroProps {
    title: string
    subtitle?: string
    description?: string
}

export default function CategoryHero({ title, subtitle, description }: CategoryHeroProps) {
    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-toyama-blue-dark to-toyama-blue mb-12 text-white shadow-lg">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-toyama-green opacity-20 rounded-full blur-2xl"></div>

            <div className="relative z-10 px-8 py-12 md:py-16 text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-4 tracking-tight text-shadow-sm">
                    {title}
                </h1>
                {subtitle && (
                    <p className="text-lg md:text-xl font-medium opacity-90 mb-2">
                        {subtitle}
                    </p>
                )}
                {description && (
                    <p className="text-sm md:text-base opacity-80 max-w-2xl mx-auto">
                        {description}
                    </p>
                )}
            </div>
        </div>
    )
}
