import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";

/**
 * Helper function to check if the current user is an admin
 * @returns {Promise<{isAdmin: boolean, user: any | null, userId: string | null}>}
 */
export async function checkAdminAuth() {
  const { userId } = await auth();
  
  if (!userId) {
    return { isAdmin: false, user: null, userId: null };
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
  });

  return {
    isAdmin: user?.role === "ADMIN",
    user,
    userId
  };
}

/**
 * Helper function to check if user is authenticated
 * @returns {Promise<{isAuthenticated: boolean, userId: string | null}>}
 */
export async function checkAuth() {
  const { userId } = await auth();
  
  return {
    isAuthenticated: !!userId,
    userId
  };
}
