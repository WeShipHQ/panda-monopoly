"use client"

import { useState, useEffect, useMemo } from "react"
import AnimatedGridBackground from "./animated-grid-background"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

export default function HeroSection() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
    const [layoutKey, setLayoutKey] = useState(0)

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY })
        }
        window.addEventListener("mousemove", handleMouseMove)
        return () => window.removeEventListener("mousemove", handleMouseMove)
    }, [])

    const randomizeLayout = () => {
        setLayoutKey(prev => prev + 1)
    }

    // Generate stable layout based on layoutKey
    const blocks = useMemo(() => {
        const sizes = [1, 1, 1, 1, 2]
        const rotations = [-4, -2, 0, 2, 4, 6]
        
        return [...Array(35)].map((_, i) => ({
            size: sizes[Math.floor(Math.random() * sizes.length)],
            rotation: rotations[Math.floor(Math.random() * rotations.length)],
            color: i % 4 === 0 ? "#ff0080" : i % 4 === 1 ? "#9945ff" : i % 4 === 2 ? "#14f195" : "#ffed00"
        }))
    }, [layoutKey])

    return (
        <div className="relative min-h-screen flex flex-col bg-white/90 border-b-8 border-black">
            <AnimatedGridBackground />

            {/* Property Blocks Grid */}
            {/* <div className="bg-grid">
                {blocks.map((block, i) => (
                    <div
                        key={i}
                        className="property-block"
                        style={{
                            // @ts-ignore
                            "--bg-color": block.color,
                            gridColumn: `span ${block.size}`,
                            gridRow: `span ${block.size}`,
                            transform: `rotate(${block.rotation}deg)`,
                            animationDelay: `${i * 0.08}s`,
                        }}
                    />
                ))}
            </div> */}

            {/* Main hero content */}
            <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-8 lg:px-24 py-20 w-full">
                <div className="mb-8 animate-[slide-in-top_0.8s_ease-out] animate-fill-both">
                    <div className="bg-[#ff0080] border-5 border-black shadow-[8px_8px_0_#000] px-6 py-3 inline-block hover:shadow-[12px_12px_0_#000] hover:-translate-y-1 hover:rotate-2 transition-all duration-300 cursor-pointer">
                        <span className="text-black font-black text-sm md:text-lg uppercase tracking-wider">
                            ⚡ BETA V1.0 - LIVE ON DEVNET
                        </span>
                    </div>
                </div>

                <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase leading-[0.85] mb-12 max-w-6xl">
                    <span className="block text-black hover:text-[#ff0080] transition-colors duration-300 animate-[slide-in-left_0.8s_ease-out] animate-fill-both cursor-pointer">
                        MONOPOLY
                    </span>
                    <span className="block text-black hover:text-[#9945ff] transition-colors duration-300 animate-[slide-in-left_0.9s_ease-out] animate-fill-both cursor-pointer">
                        ON{" "}
                        <span className="inline-block bg-[#14f195] px-4 border-6 border-black shadow-[8px_8px_0_#000] hover:shadow-[12px_12px_0_#000] hover:-translate-y-2 transition-all duration-300">
                            SOLANA
                        </span>
                    </span>
                </h1>

                <div className="bg-[#ffed00] text-black border-6 border-black shadow-[14px_14px_0_#000] px-10 py-10 max-w-3xl mb-14 hover:shadow-[20px_20px_0_#000] hover:-translate-y-3 hover:rotate-1 transition-all duration-500 animate-[slide-in-right_0.8s_ease-out_0.3s] animate-fill-both group cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-[#ff0080] translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                    <p className="text-xl md:text-3xl font-black uppercase leading-tight relative z-10 group-hover:text-black transition-colors duration-700">
                        Classic Monopoly meets Solana speed—Buy NFTs, Earn SOL, Crush opponents in decentralized chaos! 🎲
                    </p>
                </div>

                <button className="bg-[#9945ff] text-black border-6 border-black shadow-[16px_16px_0_#000] px-12 py-8 text-2xl md:text-4xl font-black uppercase max-w-fit transition-all duration-500 hover:bg-[#14f195] hover:text-black hover:scale-110 hover:rotate-3 hover:shadow-[24px_24px_0_#000] active:scale-95 active:shadow-[10px_10px_0_#000] animate-[slide-in-bottom_0.8s_ease-out_0.5s] animate-fill-both group relative overflow-hidden">
                    <span className="relative z-10">🚀 CONNECT WALLET & PLAY</span>
                    <div className="absolute inset-0 bg-[#ff0080] translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                </button>
            </div>

            <div className="relative z-10 border-t-6 border-b-6 border-black bg-[#14f195] py-6 overflow-hidden">
                <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="flex items-center shrink-0">
                            <span className="text-3xl md:text-5xl font-black uppercase text-black mx-8 [text-shadow:4px_4px_0_rgba(255,255,255,0.5)]">
                                ROLL THE DICE
                            </span>
                            <Avatar className="w-12 h-12 md:w-16 md:h-16 border-4 border-black shadow-[4px_4px_0_#000] mx-8 shrink-0">
                                <AvatarImage walletAddress="RollDice111111111111111111111111111111" />
                                <AvatarFallback
                                    walletAddress="RollDice111111111111111111111111111111"
                                    className="bg-[#ff0080] text-black text-xl font-black"
                                >
                                    RD
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-3xl md:text-5xl font-black uppercase text-black mx-8 [text-shadow:4px_4px_0_rgba(255,255,255,0.5)]">
                                BUY PROPERTIES
                            </span>
                            <Avatar className="w-12 h-12 md:w-16 md:h-16 border-4 border-black shadow-[4px_4px_0_#000] mx-8 shrink-0">
                                <AvatarImage walletAddress="BuyProperty11111111111111111111111111" />
                                <AvatarFallback
                                    walletAddress="BuyProperty11111111111111111111111111"
                                    className="bg-[#9945ff] text-black text-xl font-black"
                                >
                                    BP
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-3xl md:text-5xl font-black uppercase text-black mx-8 [text-shadow:4px_4px_0_rgba(255,255,255,0.5)]">
                                COLLECT RENT
                            </span>
                            <Avatar className="w-12 h-12 md:w-16 md:h-16 border-4 border-black shadow-[4px_4px_0_#000] mx-8 shrink-0">
                                <AvatarImage walletAddress="CollectRent1111111111111111111111111111" />
                                <AvatarFallback
                                    walletAddress="CollectRent1111111111111111111111111111"
                                    className="bg-[#ffed00] text-black text-xl font-black"
                                >
                                    CR
                                </AvatarFallback>
                            </Avatar>
                            <span className="text-3xl md:text-5xl font-black uppercase text-black mx-8 [text-shadow:4px_4px_0_rgba(255,255,255,0.5)]">
                                WIN SOL
                            </span>
                            <Avatar className="w-12 h-12 md:w-16 md:h-16 border-4 border-black shadow-[4px_4px_0_#000] mx-8 shrink-0">
                                <AvatarImage walletAddress="WinSol1111111111111111111111111111111111" />
                                <AvatarFallback
                                    walletAddress="WinSol1111111111111111111111111111111111"
                                    className="bg-[#ff0080] text-black text-xl font-black"
                                >
                                    WS
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    ))}
                </div>
            </div>

            <style jsx>{`
                .bg-grid {
                    position: absolute;
                    top: 5%;
                    left: 5%;
                    width: 90%;
                    height: 90%;
                    display: grid;
                    grid-template-columns: repeat(8, 1fr);
                    grid-template-rows: repeat(6, 1fr);
                    grid-auto-flow: dense;
                    gap: 8px;
                    z-index: 1;
                    opacity: 0.25;
                    pointer-events: none;
                }

                @media (min-width: 768px) {
                    .bg-grid {
                        grid-template-columns: repeat(12, 1fr);
                        grid-template-rows: repeat(8, 1fr);
                        gap: 10px;
                        opacity: 0.3;
                    }
                }

                @media (min-width: 1024px) {
                    .bg-grid {
                        grid-template-columns: repeat(16, 1fr);
                        grid-template-rows: repeat(10, 1fr);
                        gap: 12px;
                        opacity: 0.35;
                    }
                }

                .property-block {
                    border: 4px solid #000;
                    background: var(--bg-color);
                    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.6);
                    transition: all 0.3s ease;
                    animation: blockFadeIn 1s ease-out both;
                    min-height: 30px;
                    border-radius: 2px;
                }

                @keyframes blockFadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.8) rotate(0deg);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) rotate(var(--rotation, 0deg));
                    }
                }
            `}</style>
        </div>
    )
}
