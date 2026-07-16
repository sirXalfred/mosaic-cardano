import { ProfilePageContent } from "@/components/profile/ProfilePageContent";
import { authService } from "@/services/backend/auth.service";
import { notFound } from 'next/navigation';
import { cache } from "react";


const getUser = cache(async (username: string) => {
  return authService.getUserByUsername(username);
});

export const generateMetadata = async ({ params }: { params: Promise<{ username: string }> }) => {
  const resolvedParams = await params;
  const { username } = resolvedParams;
  const user = await getUser(username);
  if (!user) {
    return {
      title: 'User not found',
    };
  }
  return {
    title: user.displayName,
    description: user.bio,
  };
};

export default async function UserProfilePage({ 
  params,
}: { 
  params: Promise<{ username: string }>;
}) {
  const resolvedParams = await params;
  const { username } = resolvedParams;

  try {
    const user = await getUser(username);
    if (!user) {
      notFound();
    }
  } catch {
    notFound();
  }

  return (
    <ProfilePageContent username={username} />
  )
}
