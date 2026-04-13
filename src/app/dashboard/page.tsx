"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, Upload, Image as ImageIcon, User, Maximize2 } from "lucide-react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import {
  clearStoredUserId,
  getStoredUserId,
  type UserId,
} from "@/lib/clientSession";

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<UserId | null | undefined>(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = useQuery(api.auth.getUser, userId ? { userId } : "skip");
  const images = useQuery(api.images.getImages, userId ? { userId } : "skip");
  const generateUploadUrl = useMutation(api.images.generateUploadUrl);
  const saveImage = useMutation(api.images.saveImage);

  useEffect(() => {
    setUserId(getStoredUserId());
  }, []);

  useEffect(() => {
    if (userId === null) {
      router.replace("/");
    }
  }, [router, userId]);

  useEffect(() => {
    if (userId && user === null) {
      clearStoredUserId();
      router.replace("/");
    }
  }, [router, user, userId]);

  const handleLogout = () => {
    clearStoredUserId();
    router.push("/");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUploadError("");
    setIsUploading(true);

    try {
      const uploadUrl = await generateUploadUrl({});
      const uploadResponse = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        body: file,
      });

      if (!uploadResponse.ok) {
        throw new Error("Convex storage upload failed.");
      }

      const { storageId } = (await uploadResponse.json()) as {
        storageId: Id<"_storage">;
      };

      await saveImage({
        storageId,
        userId,
        format: file.type || "image/png",
        name: file.name,
      });
    } catch (error) {
      console.error("Upload failed", error);
      setUploadError(error instanceof Error ? error.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  if (userId === undefined || user === undefined || images === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-mavr-bg">
        <div className="w-10 h-10 border-4 border-mavr-red border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-mavr-bg text-white font-sans selection:bg-mavr-red selection:text-white pb-20">
      {/* Top Navbar */}
      <nav className="glass sticky top-0 z-40 border-b border-white/5 py-4 px-6 flex justify-between items-center w-full">
        <div className="flex items-center space-x-3">
          <div className="font-outfit font-bold tracking-[0.2em] text-xl drop-shadow-[0_0_10px_rgba(229,9,20,0.5)]">
            MAVR
          </div>
        </div>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2 text-sm text-mavr-muted">
            <User size={16} />
            <span>{user?.name || "User"}</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-mavr-muted hover:text-white transition-colors p-2"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 pt-10">
        
        {/* Upload Action Area */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="relative bg-gradient-to-r from-white/5 to-white/0 border border-white/10 rounded-3xl p-8 mb-12 overflow-hidden group"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-outfit font-light mb-2">Upload your recent plays</h2>
              <p className="text-mavr-muted text-sm max-w-md">Share your best clips and screenshots with the MAVR community. High performance, real-time sync.</p>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-8 py-4 bg-mavr-red hover:bg-mavr-red-hover rounded-full font-medium flex items-center space-x-3 transition-colors shadow-[0_0_20px_rgba(229,9,20,0.3)] min-w-[200px] justify-center"
            >
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload size={20} />
                  <span>Choose Image</span>
                </>
              )}
            </motion.button>
          </div>
          {uploadError ? (
            <p className="relative z-10 mt-4 text-sm text-red-400">{uploadError}</p>
          ) : null}
          <div className="absolute right-0 top-0 w-1/2 h-full bg-mavr-red/5 filter blur-3xl rounded-full transform translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
        </motion.div>

        {/* Dynamic Image Grid */}
        <h3 className="text-lg font-medium mb-6 flex items-center space-x-2">
          <ImageIcon size={20} className="text-mavr-red" />
          <span>Your Media</span>
        </h3>

        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 border border-dashed border-white/10 rounded-3xl bg-white/5">
            <ImageIcon size={48} className="text-white/20 mb-4" />
            <p className="text-mavr-muted">No media uploaded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {images.map((img, index) => (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                key={img._id}
                className="group relative aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 cursor-pointer"
              >
                {img.url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.name ?? "Uploaded media"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/5 text-mavr-muted">
                    File unavailable
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <div className="flex justify-between items-center text-white">
                    <span className="text-xs text-white/70">
                      {new Date(img.uploadedAt).toLocaleDateString()}
                    </span>
                    <button className="bg-white/20 hover:bg-white/40 p-2 rounded-full backdrop-blur-md transition-colors">
                      <Maximize2 size={14} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
