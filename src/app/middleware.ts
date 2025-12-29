import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

const PUBLIC_ROUTES = [
    "/",
    "/auth/login",
    "/auth/register",
    "/auth/forgot-password",
]

export async function middlware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // Allow public routes
    if (PUBLIC_ROUTES.some(route=> pathname.startsWith(route))) {
        return NextResponse.next()
    }

    // Get session token
    const token = await getToken({
        req,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // Not logged in, redirect to login
    if (!token) {
        const loginUrl = new URL("/auth/login", req.url)
        return NextResponse.redirect(loginUrl)
    }

    // Logged in role
    const role = token.role as "doctor" || "patient"
    
    // Patient trying to access doctor routes
    if (pathname.startsWith("/doctor") && role !== "doctor") {
        return NextResponse.redirect(new URL("/patient/dashboard", req.url))
    }

    // Doctor trying to access patient routes
    if (pathname.startsWith("/patient") && role !== "patient") {
        return NextResponse.redirect(new URL("/doctor/dashboard", req.url))
    }

    return NextResponse.next()
}

    export const config = {
        matcher: [
            "/doctor/:path*",
            "/patient/:path*",
        ],
    }
