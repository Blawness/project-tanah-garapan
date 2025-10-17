import { withAuth } from 'next-auth/middleware'

export default withAuth(
  function middleware() {
    // Additional middleware logic can be added here
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Protect all routes except login, public assets, and API routes
        if (req.nextUrl.pathname.startsWith('/login')) {
          return true
        }

        if (req.nextUrl.pathname.startsWith('/api/auth')) {
          return true
        }

        if (req.nextUrl.pathname.startsWith('/api/')) {
          return true // Allow API routes to pass through without authentication
        }

        // Require authentication for all other routes
        return !!token
      },
    },
  }
)

// export default withAuth(
//   function middleware(req) {
//     // Additional middleware logic can be added here
//   },
//   {
//     callbacks: {
//       authorized: ({ token, req }) => {
//         // Protect all routes except login, public assets, and API routes
//         if (req.nextUrl.pathname.startsWith('/login')) {
//           return true
//         }

//         if (req.nextUrl.pathname.startsWith('/api/auth')) {
//           return true
//         }

//         if (req.nextUrl.pathname.startsWith('/api/')) {
//           return true // Allow API routes to pass through without authentication
//         }

//         // Require authentication for all other routes
//         return !!token
//       },
//     },
//   }
// )

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
