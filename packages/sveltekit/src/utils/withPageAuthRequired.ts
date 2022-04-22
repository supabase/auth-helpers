interface PageAuthRequiredOpts {
  redirectTo: string;
}

export default async function withPageAuthRequired({
  redirectTo
}: PageAuthRequiredOpts) {
  // if (!session.user) {
  //   return {
  //     status: 304
  //   };
  // }
}
