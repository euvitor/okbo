import { useRef, useState } from "react"
import { supabase } from "../lib/supabaseClient"

interface ProfilePicProps {
    userId: string
    avatarUrl: string | null
    onUploadSuccess: (newUrl: string) => void
}

export function ProfilePic({ userId, avatarUrl, onUploadSuccess }: ProfilePicProps) {
    const [isUploading, setIsUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleImageClick = () => {
        if (!isUploading) {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setIsUploading(true)
            const file = event.target.files?.[0]
            if (!file) return

            if (avatarUrl) {
                const oldFilePath = avatarUrl.split('/').pop()
                if (oldFilePath) {
                    await supabase.storage.from('avatars').remove([oldFilePath])
                }
            }

            // avoid cache creating a unique file name
            const fileExt = file.name.split('.').pop()
            const filePath = `${userId}-${Math.random()}.${fileExt}`

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // get the new image public URL
            const { data } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath)
            const publicUrl = data.publicUrl

            // refresh profile table in database
            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', userId)

            if (updateError) throw updateError

            // notify the parent component(myShelf) that the image has changed
            onUploadSuccess(publicUrl)

        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error uploading file. Please try again.')
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    return (
        <div className="relative group w-48 h-48 rounded-full overflow-hidden shadow-xl glass cursor-pointer shrink-0">
            {avatarUrl ? (
                <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center text-gray-500 dark:text-gray-400">
                    <span className="text-sm font-medium">No Photo</span>
                </div>
            )}

            {/* hover overlay */}
            <div
                onClick={handleImageClick}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center text-white"
            >
                {isUploading ? (
                    <span className="text-sm font-medium animate-pulse">Uploading...</span>
                ) : (
                    <span className="text-sm font-medium shadow-sm">Change Photo</span>
                )}
            </div>

            {/* hidden file input */}
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
            />
        </div>
    )
}