'use client'

import { useState, useEffect, useRef } from 'react'
import { municipalities } from './municipalities_data'

interface Area {
    id: string
    name: string
    nameEn: string
    description: string
    descriptionEn: string
    cities: string
    citiesEn: string
    color: string
    bgColor: string
    textColor: string
    borderColor: string
}

const areas: Area[] = [
    {
        id: 'gosei',
        name: '呉西エリア',
        nameEn: 'Gosei Area',
        description: '高岡銅器や瑞龍寺、氷見の寒ブリなど、歴史と伝統、食の魅力が詰まった商工業の中心地。',
        descriptionEn: 'The industrial and commercial center of the prefecture, rich in history and tradition, featuring Takaoka copperware, Zuiryu-ji Temple, and Himi winter yellowtail.',
        cities: '高岡市 / 氷見市 / 射水市',
        citiesEn: 'Takaoka City / Himi City / Imizu City',
        color: 'fill-orange-500',
        bgColor: 'bg-orange-500',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-500'
    },
    {
        id: 'tonami',
        name: '砺波エリア',
        nameEn: 'Tonami Area',
        description: 'チューリップ、散居村の風景、世界遺産・五箇山の合掌造り集落など、日本の原風景が残る場所。',
        descriptionEn: 'A place where the original landscapes of Japan remain, including tulips, "Sankyoson" (dispersed settlements), and the UNESCO World Heritage site of Gokayama.',
        cities: '砺波市 / 南砺市 / 小矢部市',
        citiesEn: 'Tonami City / Nanto City / Oyabe City',
        color: 'fill-emerald-500',
        bgColor: 'bg-emerald-500',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-500'
    },
    {
        id: 'gotou',
        name: '富山エリア',
        nameEn: 'Toyama Area',
        description: '県都・富山市を中心に、立山連峰を望む美しい景色と、ガラス工芸、薬など多彩な産業が共生する街。',
        descriptionEn: 'Centered around the prefectural capital, Toyama City, this area offers beautiful views of the Tateyama Peaks and a mix of industries like glass art and medicine.',
        cities: '富山市 / 舟橋村 / 上市町 / 立山町',
        citiesEn: 'Toyama City / Funahashi Village / Kamiichi Town / Tateyama Town',
        color: 'fill-amber-500',
        bgColor: 'bg-amber-500',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-500'
    },
    {
        id: 'niikawa',
        name: '新川エリア',
        nameEn: 'Niikawa Area',
        description: '黒部峡谷トロッコ電車や宇奈月温泉、ホタルイカなど、神秘的な自然と名水に恵まれた里。',
        descriptionEn: 'A region blessed with mysterious nature and premium spring water, home to the Kurobe Gorge Railway, Unazuki Onsen, and firefly squid.',
        cities: '魚津市 / 黒部市 / 滑川市 / 入善町 / 朝日町',
        citiesEn: 'Uozu City / Kurobe City / Namerikawa City / Nyuzen Town / Asahi Town',
        color: 'fill-cyan-500',
        bgColor: 'bg-cyan-500',
        textColor: 'text-cyan-700',
        borderColor: 'border-cyan-500'
    }
]

interface ToyamaMapProps {
    locale?: 'ja' | 'en'
    basePath?: string
}

export default function ToyamaMap({ locale = 'ja', basePath = '' }: ToyamaMapProps) {
    const [activeAreaId, setActiveAreaId] = useState<string | null>(null)
    const [hoveredMuni, setHoveredMuni] = useState<string | null>(null)
    const [isSticky, setIsSticky] = useState(false)
    const [hasHover, setHasHover] = useState(true)
    const mobilePanelRef = useRef<HTMLDivElement>(null)

    const isEn = locale === 'en'

    useEffect(() => {
        const mediaQuery = window.matchMedia('(hover: hover)')
        setHasHover(mediaQuery.matches)

        const handler = (e: MediaQueryListEvent) => setHasHover(e.matches)
        mediaQuery.addEventListener('change', handler)

        const handleScroll = () => {
            const mapElement = document.getElementById('toyama-map-container')
            if (mapElement) {
                const rect = mapElement.getBoundingClientRect()
                setIsSticky(rect.top <= 80)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            mediaQuery.removeEventListener('change', handler)
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    const handleMuniClick = (name: string) => {
        window.location.href = `${basePath}/category/${name}`
    }

    const currentArea = areas.find(a => a.id === activeAreaId)

    return (
        <div id="toyama-map-container" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative max-w-7xl mx-auto px-4 py-8">
            {/* Left: Map Area */}
            <div className="lg:col-span-7 xl:col-span-8 bg-white/50 backdrop-blur-sm rounded-3xl p-4 lg:p-8 shadow-sm border border-gray-100">
                <div className="relative aspect-[800/726] w-full">
                    <svg
                        viewBox="0 0 800 726"
                        className="w-full h-full drop-shadow-2xl transition-all duration-500 ease-out"
                        style={{ filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.08))' }}
                    >
                        <defs>
                            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation="3" />
                                <feOffset dx="0" dy="2" result="offsetblur" />
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope="0.2" />
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>

                        {municipalities.map((muni) => {
                            const area = areas.find(a => a.id === muni.areaId)
                            const isHovered = hoveredMuni === muni.id
                            const isActiveArea = activeAreaId === muni.areaId
                            const muniName = isEn && muni.nameEn ? muni.nameEn : muni.name

                            return (
                                <g
                                    key={muni.id}
                                    onMouseEnter={() => {
                                        setHoveredMuni(muni.id)
                                        setActiveAreaId(muni.areaId)
                                    }}
                                    onMouseLeave={() => setHoveredMuni(null)}
                                    onClick={() => handleMuniClick(muni.name)}
                                    className="cursor-pointer"
                                >
                                    <path
                                        d={muni.path}
                                        className={`
                                            transition-all duration-300 ease-out
                                            ${area?.color || 'fill-gray-200'} stroke-white/40 stroke-2
                                            ${isActiveArea ? 'opacity-100 scale-[1.005]' : 'opacity-70 scale-100'}
                                            ${isHovered ? 'filter drop-shadow-xl brightness-110 !opacity-100 scale-[1.01]' : ''}
                                        `}
                                        style={{ transformOrigin: 'center', transformBox: 'fill-box' }}
                                    />
                                    {isHovered && (
                                        <g className="pointer-events-none transition-all duration-300">
                                            <text
                                                x={muni.cx}
                                                y={muni.cy}
                                                textAnchor="middle"
                                                className="fill-white font-bold text-[10px] pointer-events-none"
                                                style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.8))' }}
                                            >
                                                {muniName}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            )
                        })}
                    </svg>

                    {/* Quick Access Pills for Mobile */}
                    <div className="flex lg:hidden flex-wrap gap-2 mt-8 justify-center">
                        {areas.map((area) => (
                            <button
                                key={area.id}
                                onClick={() => setActiveAreaId(area.id)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-bold transition-all duration-300
                                    ${activeAreaId === area.id
                                        ? `${area.bgColor} text-white shadow-lg scale-105`
                                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-100 shadow-sm'
                                    }
                                `}
                            >
                                {isEn ? area.nameEn : area.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right: Info Panel */}
            <div className={`lg:col-span-5 xl:col-span-4 transition-all duration-300 ${isSticky ? 'lg:sticky lg:top-24' : ''}`}>
                {currentArea ? (() => {
                    const area = currentArea
                    const areaCities = (isEn ? area.citiesEn : area.cities).split(' / ')
                    const jaCities = area.cities.split(' / ')
                    return (
                        <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden group min-h-[320px]">
                            {/* Accent Background */}
                            <div className={`absolute top-0 right-0 w-32 h-32 ${area.bgColor} opacity-5 -mr-16 -mt-16 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-150`} />

                            <div className="relative space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-1.5 rounded-full ${area.bgColor}`} />
                                        <span className={`text-sm font-bold tracking-widest uppercase ${area.textColor}`}>Area Region</span>
                                    </div>
                                    <h3 className="text-4xl font-black text-gray-900 tracking-tight">{isEn ? area.nameEn : area.name}</h3>
                                </div>

                                <p className="text-gray-600 leading-relaxed text-lg">
                                    {isEn ? area.descriptionEn : area.description}
                                </p>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2">
                                        <div className={`p-2 rounded-lg ${area.bgColor} bg-opacity-10`}>
                                            <svg className={`w-5 h-5 ${area.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                            {isEn ? 'Click Municipality' : '地域をクリック'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {areaCities.map((city, idx) => (
                                            <button
                                                key={city}
                                                onClick={() => handleMuniClick(jaCities[idx])}
                                                className={`
                                                    px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300
                                                    bg-gray-50 text-gray-600 hover:bg-white hover:shadow-md border border-transparent hover:${area.borderColor}
                                                `}
                                            >
                                                {city}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <div className={`inline-flex items-center gap-2 text-sm font-bold ${area.textColor} group/btn`}>
                                        {isEn ? 'Click on map directly' : '地図上の各市町村を直接クリック'}
                                        <svg className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })() : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50 rounded-[2rem] p-12 border-2 border-dashed border-gray-200 gap-4 min-h-[320px]">
                        <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-2">
                            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                            </svg>
                        </div>
                        <p className="font-bold text-center leading-relaxed text-gray-400 text-lg">
                            {isEn ? (
                                <>Click or tap on the map<br />to see details</>
                            ) : (
                                <>地図の市町村をクリック<br />またはタップしてください</>
                            )}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
