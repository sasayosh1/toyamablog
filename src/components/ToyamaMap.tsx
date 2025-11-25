'use client'

import React, { useState } from 'react'
import Link from 'next/link'

type Area = {
    id: string
    name: string
    label: string
    description: string
    color: string
    path: string
    href: string
    x: number
    y: number
}

const areas: Area[] = [
    {
        id: 'gosei',
        name: '呉西エリア',
        label: '高岡・氷見・射水',
        description: '歴史ある街並みと海の幸',
        color: 'fill-blue-400',
        // 左上エリア（氷見・高岡・射水）
        path: 'M 100,150 L 250,150 L 300,250 L 250,350 L 100,300 Z',
        href: '/category/高岡市', // 代表的なカテゴリへ
        x: 180,
        y: 220
    },
    {
        id: 'tonami',
        name: '砺波エリア',
        label: '砺波・南砺・小矢部',
        description: '散居村の風景と世界遺産',
        color: 'fill-green-500',
        // 左下エリア（砺波・南砺）
        path: 'M 100,300 L 250,350 L 300,450 L 150,550 L 50,450 Z',
        href: '/category/砺波市',
        x: 180,
        y: 420
    },
    {
        id: 'gotou',
        name: '富山エリア',
        label: '富山市・立山',
        description: '都市の賑わいと雄大な山々',
        color: 'fill-indigo-500',
        // 中央エリア（富山市）
        path: 'M 250,150 L 450,150 L 500,300 L 450,550 L 300,450 L 250,350 L 300,250 Z',
        href: '/category/富山市',
        x: 380,
        y: 300
    },
    {
        id: 'niikawa',
        name: '新川エリア',
        label: '魚津・黒部・朝日',
        description: '秘境トロッコと名水の里',
        color: 'fill-cyan-500',
        // 右エリア（魚津・黒部）
        path: 'M 450,150 L 650,100 L 700,300 L 550,500 L 450,550 L 500,300 Z',
        href: '/category/黒部市',
        x: 550,
        y: 250
    }
]

export default function ToyamaMap() {
    const [hoveredArea, setHoveredArea] = useState<string | null>(null)

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="relative aspect-[4/3] w-full bg-blue-50/50 rounded-3xl overflow-hidden border border-blue-100 shadow-inner">
                {/* 背景の装飾（富山湾） */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-200/30 to-transparent pointer-events-none" />

                <svg
                    viewBox="0 0 800 600"
                    className="w-full h-full drop-shadow-xl"
                    style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                >
                    {areas.map((area) => (
                        <Link key={area.id} href={area.href} className="group outline-none">
                            <path
                                d={area.path}
                                className={`
                  ${area.color} 
                  transition-all duration-300 ease-out
                  stroke-white stroke-[3]
                  ${hoveredArea === area.id ? 'opacity-100 scale-105' : 'opacity-80 hover:opacity-100'}
                `}
                                style={{
                                    transformOrigin: `${area.x}px ${area.y}px`,
                                    transform: hoveredArea === area.id ? 'scale(1.02)' : 'scale(1)'
                                }}
                                onMouseEnter={() => setHoveredArea(area.id)}
                                onMouseLeave={() => setHoveredArea(null)}
                            />

                            {/* エリアラベル（常時表示またはホバー時強調） */}
                            <text
                                x={area.x}
                                y={area.y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className={`
                  text-lg font-bold fill-white pointer-events-none
                  transition-all duration-300
                  ${hoveredArea === area.id ? 'text-2xl drop-shadow-md' : 'drop-shadow-sm'}
                `}
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                            >
                                {area.name}
                            </text>
                        </Link>
                    ))}
                </svg>

                {/* ホバー時の情報パネル */}
                <div className={`
          absolute bottom-6 left-6 right-6 
          bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100
          transition-all duration-300 transform
          ${hoveredArea ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
        `}>
                    {hoveredArea && (() => {
                        const area = areas.find(a => a.id === hoveredArea)!
                        return (
                            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${area.color.replace('fill-', 'bg-')}`} />
                                        {area.name}
                                        <span className="text-sm font-normal text-gray-500">({area.label})</span>
                                    </h3>
                                    <p className="text-gray-600 mt-1">{area.description}</p>
                                </div>
                                <div className="flex-shrink-0">
                                    <span className="inline-flex items-center px-4 py-2 bg-toyama-blue text-white text-sm font-bold rounded-full">
                                        記事を見る →
                                    </span>
                                </div>
                            </div>
                        )
                    })()}
                </div>

                {/* デフォルトの案内メッセージ（ホバーしていない時） */}
                <div className={`
          absolute bottom-6 left-0 right-0 text-center pointer-events-none
          transition-all duration-300
          ${hoveredArea ? 'opacity-0' : 'opacity-100'}
        `}>
                    <span className="inline-block bg-white/80 backdrop-blur px-4 py-2 rounded-full text-gray-500 text-sm shadow-sm">
                        地図のエリアをタップして地域を選択
                    </span>
                </div>
            </div>
        </div>
    )
}
