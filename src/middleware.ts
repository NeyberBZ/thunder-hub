// import { defineMiddleware } from "astro:middleware";

// export const onRequest =
//   defineMiddleware(
//     async (context, next) => {

//       const url =
//         context.url.pathname;

//       if (
//         url.startsWith("/admin")
//       ) {

//         const session =
//           context.cookies.get(
//             "sb-access-token"
//           );

//         if (!session) {

//           return context.redirect(
//             "/login"
//           );

//         }
//       }

//       return next();

//     }
//   );