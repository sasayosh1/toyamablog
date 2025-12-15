'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Area = {
    id: string
    name: string
    enName: string
    label: string
    description: string
    cities: string // 市町村リストを追加
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
        enName: 'GO-WEST',
        label: '高岡・氷見・射水',
        description: '国宝・瑞龍寺や雨晴海岸など、歴史と絶景が息づくエリア。新鮮な海の幸も魅力です。',
        cities: '高岡市 / 氷見市 / 射水市',
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
        enName: 'TONAMI',
        label: '砺波・南砺・小矢部',
        description: '散居村の美しい田園風景と、世界遺産・五箇山合掌造り集落がある日本の原風景。',
        cities: '砺波市 / 南砺市 / 小矢部市',
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
        enName: 'TOYAMA CITY',
        label: '富山市・立山',
        description: '富山県の中心地。富山駅周辺のグルメから、立山黒部アルペンルートの大自然まで楽しめます。',
        cities: '富山市 / 立山町 / 上市町 / 舟橋村',
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
        enName: 'NIIKAWA',
        label: '魚津・黒部・朝日',
        description: '黒部峡谷トロッコ電車や宇奈月温泉、ホタルイカなど、神秘的な自然と名水に恵まれた里。',
        cities: '魚津市 / 黒部市 / 滑川市 / 入善町 / 朝日町',
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
    const [isSticky, setIsSticky] = useState(false)
    const [hasHover, setHasHover] = useState(true) // デフォルトはPC（ホバーあり）と仮定

    // タッチデバイスかどうか（ホバーが使えるか）を判定
    useEffect(() => {
        const mediaQuery = window.matchMedia('(hover: hover)')
        setHasHover(mediaQuery.matches)

        const handler = (e: MediaQueryListEvent) => setHasHover(e.matches)
        mediaQuery.addEventListener('change', handler)
        return () => mediaQuery.removeEventListener('change', handler)
    }, [])

    return (
        <div className="w-full max-w-4xl mx-auto p-4">
            <div className="relative w-full bg-blue-50/50 rounded-3xl overflow-hidden border border-blue-100 shadow-inner mb-6">
                {/* 背景の装飾（富山湾） */}
                <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-b from-blue-200/30 to-transparent pointer-events-none" />

                <div className="aspect-[4/3] w-full relative">
                    <svg
                        viewBox="0 0 800 600"
                        className="w-full h-full drop-shadow-xl"
                        style={{ filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}
                        onClick={() => {
                            // 背景クリックで選択解除
                            setHoveredArea(null)
                            setIsSticky(false)
                        }}
                    >
                        {areas.map((area) => (
                            <g key={area.id} className="group outline-none cursor-pointer">
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
                                    // PC（ホバー対応デバイス）のみホバーイベントを有効化
                                    onMouseEnter={() => {
                                        if (hasHover) {
                                            setHoveredArea(area.id)
                                            setIsSticky(false)
                                        }
                                    }}
                                    onMouseLeave={() => {
                                        if (hasHover && !isSticky) {
                                            setHoveredArea(null)
                                        }
                                    }}
                                    // クリック/タップ時の処理
                                    onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        setHoveredArea(area.id)
                                        setIsSticky(true)
                                    }}
                                />

                                {/* エリアラベル */}
                                <g
                                    className={`transition-all duration-300 pointer-events-none`}
                                    style={{
                                        transform: hoveredArea === area.id ? 'scale(1.1)' : 'scale(1)',
                                        transformOrigin: `${area.x}px ${area.y}px`
                                    }}
                                >
                                    <text
                                        x={area.x}
                                        y={area.y - 10}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-lg font-bold fill-white drop-shadow-md"
                                        style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
                                    >
                                        {area.name}
                                    </text>
                                    <text
                                        x={area.x}
                                        y={area.y + 12}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        className="text-xs font-bold fill-white/90 tracking-widest uppercase drop-shadow-sm"
                                        style={{ fontFamily: 'var(--font-geist-mono)', letterSpacing: '0.1em' }}
                                    >
                                        {area.enName}
                                    </text>
                                </g>
                            </g>
                        ))}
                    </svg>
                </div>

	                {/* PC用：ホバー時の情報パネル */}
	                <div className={`
	          hidden md:block
	          absolute bottom-6 left-6 right-6 
	          transition-all duration-300 transform
	          ${hoveredArea ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0 pointer-events-none'}
	        `}>
	                    {hoveredArea && (() => {
	                        const area = areas.find(a => a.id === hoveredArea)!
                            const cityList = area.cities.split(' / ')
	                        return (
	                            <div className="bg-white/95 backdrop-blur-md rounded-xl p-6 shadow-lg border border-gray-100">
	                                <div className="flex flex-col gap-3">
	                                    <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
	                                        <span className={`w-4 h-4 rounded-full ${area.color.replace('fill-', 'bg-')}`} />
	                                        <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3 flex-wrap">
	                                            <Link href={area.href} className="hover:underline underline-offset-4">
	                                                {area.name}
	                                            </Link>
	                                            <span className="text-sm font-normal text-gray-400 font-mono tracking-wider ml-2">{area.enName}</span>
	                                        </h3>
	                                    </div>

	                                    <p className="text-gray-700 leading-relaxed font-medium">
	                                        {area.description}
	                                    </p>

                                        {/* PCでも市町村へ直接移動できるようにする */}
                                        <div className="pt-2">
                                            <p className="text-xs text-gray-400 mb-2 font-bold">市町村を選択して記事を見る</p>
                                            <div className="flex flex-wrap gap-2">
                                                {cityList.map((city) => (
                                                    <Link
                                                        key={city}
                                                        href={`/category/${city}`}
                                                        className="inline-block px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                                                    >
                                                        {city}
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
	                                </div>
	                            </div>
	                        )
	                    })()}
	                </div>
	            </div>

            {/* スマホ用：選択時の情報パネル（地図の下に表示） */}
            <div className="md:hidden min-h-[200px]">
                {hoveredArea ? (() => {
                    const area = areas.find(a => a.id === hoveredArea)!
                    const cityList = area.cities.split(' / ')

                    return (
                        <div
                            className="block bg-white rounded-xl p-6 shadow-md border border-gray-100 animate-fade-in"
                        >
                            <div className="flex flex-col gap-4">
                                <div className="flex items-center gap-3 border-b border-gray-100 pb-2">
                                    <span className={`w-4 h-4 rounded-full ${area.color.replace('fill-', 'bg-')}`} />
                                    <h3 className="text-2xl font-bold text-gray-900">
                                        {area.name}
                                        <span className="text-sm font-normal text-gray-400 font-mono tracking-wider ml-2">{area.enName}</span>
                                    </h3>
                                </div>

                                <p className="text-gray-700 leading-relaxed font-medium">
                                    {area.description}
                                </p>

                                {/* 市町村リストをボタンとして表示 */}
                                <div>
                                    <p className="text-xs text-gray-400 mb-2 font-bold">地域を選択して記事を見る</p>
                                    <div className="flex flex-wrap gap-2">
                                        {cityList.map((city) => (
                                            <Link
                                                key={city}
                                                href={`/category/${city}`}
                                                className="inline-block px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-lg border border-gray-200 active:bg-blue-50 active:border-blue-300 active:text-blue-600 transition-colors"
                                            >
                                                {city}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })() : (
                    <div className="flex items-center justify-center h-full text-gray-400 text-sm bg-gray-50 rounded-xl p-8 border border-dashed border-gray-200">
                        <p>地図のエリアをタップすると詳細が表示されます</p>
                    </div>
                )}
            </div>
        </div>
    )
}
