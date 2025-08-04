import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { prisma } from "@/lib/db";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

type ClerkUserData = {
  id: string;
  email_addresses: Array<{ email_address: string }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  created_at: number;
  updated_at: number;
};

export async function POST(request: NextRequest) {
  if (!webhookSecret) {
    throw new Error("Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local");
  }

  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await request.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(webhookSecret);

  let evt: { type: string; data: ClerkUserData };

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as { type: string; data: ClerkUserData };
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  const eventType = evt.type;
  
  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}

async function handleUserCreated(userData: ClerkUserData) {
  console.log("Creating user:", userData.id);
  
  try {
    await prisma.user.create({
      data: {
        clerkId: userData.id,
        email: userData.email_addresses[0]?.email_address || "",
        name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null,
        image: userData.image_url || null,
        createdAt: new Date(userData.created_at),
        updatedAt: new Date(userData.updated_at),
      },
    });
    
    console.log("User created successfully:", userData.id);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
}

async function handleUserUpdated(userData: ClerkUserData) {
  console.log("Updating user:", userData.id);
  
  try {
    await prisma.user.update({
      where: { clerkId: userData.id },
      data: {
        email: userData.email_addresses[0]?.email_address || "",
        name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim() || null,
        image: userData.image_url || null,
        updatedAt: new Date(userData.updated_at),
      },
    });
    
    console.log("User updated successfully:", userData.id);
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
}

async function handleUserDeleted(userData: ClerkUserData) {
  console.log("Deleting user:", userData.id);
  
  try {
    await prisma.user.delete({
      where: { clerkId: userData.id },
    });
    
    console.log("User deleted successfully:", userData.id);
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
}
