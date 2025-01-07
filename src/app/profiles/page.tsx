'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import { createClient } from '@supabase/supabase-js'

// Configure allowed image domains
const imageLoader = ({ src }: { src: string }) => {
  if (src.startsWith('http')) {
    return src
  }
  return `/images${src}`
}

export default function ProfilePage() {
  const [userData, setUserData] = useState({
    name: '',
    businessName: '',
    email: '',
    phone: '',
    address: '',
    bio: '',
    avatar: '/default-avatar.png',
    website: '',
    photos: [] as string[],
    socialMedia: {
      facebook: '',
      instagram: '',
      twitter: ''
    }
  })

  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [uploadedImage, setUploadedImage] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>('/default-avatar.png')

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ckfacmggijsjvrfkjudv.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNrZmFjbWdnaWpzanZyZmtqdWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUyOTE5NTgsImV4cCI6MjA1MDg2Nzk1OH0.LGtG_bl2-kJJKBIYT0T1PIi46Mh8qjXOPSGwc9sKtpI'
  )

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) throw new Error('Not authenticated')

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (error) throw error

        if (profile) {
          setUserData(prevUserData => ({
            ...prevUserData,
            ...profile,
            avatar: profile.avatar_url || '/default-avatar.png',
            photos: profile.photos || []
          }))
          setPreviewUrl(profile.avatar_url || '/default-avatar.png')
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setUploadedImage(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  const uploadImage = async (userId: string) => {
    if (!uploadedImage) return null

    const fileExt = uploadedImage.name.split('.').pop()
    const fileName = `${userId}-${Math.random()}.${fileExt}`
    const filePath = `photos/${fileName}`

    try {
      // Upload to photos bucket
      const { error: uploadError } = await supabase.storage
        .from('photos')
        .upload(filePath, uploadedImage)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('photos')
        .getPublicUrl(filePath)

      // Update profile photos array
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data: profile } = await supabase
        .from('profiles')
        .select('photos')
        .eq('id', user.id)
        .single()

      const currentPhotos = profile?.photos || []
      const updatedPhotos = [...currentPhotos, publicUrl]

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          photos: updatedPhotos,
          avatar_url: publicUrl 
        })
        .eq('id', user.id)

      if (updateError) throw updateError

      setUserData(prevState => ({
        ...prevState,
        photos: updatedPhotos,
        avatar: publicUrl
      }))

      return publicUrl
    } catch (error) {
      console.error('Error uploading image:', error)
      return null
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setUserData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSocialMediaChange = (platform: string, value: string) => {
    setUserData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: value
      }
    }))
  }

  const handleSubmit = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      let avatarUrl = userData.avatar
      if (uploadedImage) {
        const newAvatarUrl = await uploadImage(user.id)
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl
        }
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name: userData.name,
          business_name: userData.businessName,
          email: userData.email,
          phone: userData.phone,
          address: userData.address,
          bio: userData.bio,
          website: userData.website,
          social_media: userData.socialMedia,
          avatar_url: avatarUrl,
          photos: userData.photos,
          updated_at: new Date()
        })

      if (error) throw error
      
      setUserData(prevState => ({
        ...prevState,
        avatar: avatarUrl
      }))
      setIsEditing(false)
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-indigo-600 text-2xl font-semibold">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-12">
      <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="md:flex">
          {/* Left Panel */}
          <div className="md:w-2/5 bg-gradient-to-b from-indigo-600 to-indigo-800 p-12 text-white">
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48 rounded-full overflow-hidden border-6 border-white mb-6 shadow-xl">
                <Image
                  src={previewUrl}
                  alt="Profile picture"
                  layout="fill"
                  objectFit="cover"
                  className="hover:scale-110 transition-transform duration-300"
                />
                {isEditing && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <span className="text-white text-sm">Change Photo</span>
                  </label>
                )}
              </div>
              {!isEditing ? (
                <>
                  <h1 className="text-4xl font-bold mb-2">{userData.name}</h1>
                  <h2 className="text-2xl opacity-90 mb-6">{userData.businessName}</h2>
                  <div className="w-full space-y-4">
                    <p className="text-lg"><span className="opacity-75">Website:</span> {userData.website}</p>
                    <div className="space-y-2">
                      <p className="text-lg opacity-75">Social Media:</p>
                      <div className="pl-4 space-y-1">
                        <p>Facebook: {userData.socialMedia.facebook}</p>
                        <p>Instagram: {userData.socialMedia.instagram}</p>
                        <p>Twitter: {userData.socialMedia.twitter}</p>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full space-y-4">
                  <input
                    name="name"
                    value={userData.name}
                    onChange={handleInputChange}
                    className="w-full text-black rounded-lg px-4 py-2 text-xl"
                    placeholder="Your Name"
                  />
                  <input
                    name="businessName"
                    value={userData.businessName}
                    onChange={handleInputChange}
                    className="w-full text-black rounded-lg px-4 py-2 text-xl"
                    placeholder="Business Name"
                  />
                  <input
                    name="website"
                    value={userData.website}
                    onChange={handleInputChange}
                    className="w-full text-black rounded-lg px-4 py-2"
                    placeholder="Website URL"
                  />
                  <div className="space-y-2">
                    <p className="text-lg">Social Media:</p>
                    <input
                      value={userData.socialMedia.facebook}
                      onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                      className="w-full text-black rounded-lg px-4 py-2 mb-2"
                      placeholder="Facebook URL"
                    />
                    <input
                      value={userData.socialMedia.instagram}
                      onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                      className="w-full text-black rounded-lg px-4 py-2 mb-2"
                      placeholder="Instagram URL"
                    />
                    <input
                      value={userData.socialMedia.twitter}
                      onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                      className="w-full text-black rounded-lg px-4 py-2"
                      placeholder="Twitter URL"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel */}
          <div className="p-12 md:w-3/5">
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Contact Information</h3>
                {!isEditing ? (
                  <div className="space-y-4 text-lg">
                    <p className="flex items-center">
                      <span className="w-24 font-medium">Email:</span>
                      <span className="text-gray-700">{userData.email}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-24 font-medium">Phone:</span>
                      <span className="text-gray-700">{userData.phone}</span>
                    </p>
                    <p className="flex items-center">
                      <span className="w-24 font-medium">Address:</span>
                      <span className="text-gray-700">{userData.address}</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <input
                      name="email"
                      value={userData.email}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-lg"
                      placeholder="Email"
                    />
                    <input
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-lg"
                      placeholder="Phone"
                    />
                    <input
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      className="w-full border-2 rounded-lg px-4 py-3 text-lg"
                      placeholder="Address"
                    />
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">About</h3>
                {!isEditing ? (
                  <p className="text-gray-700 text-lg leading-relaxed">{userData.bio}</p>
                ) : (
                  <textarea
                    name="bio"
                    value={userData.bio}
                    onChange={handleInputChange}
                    className="w-full border-2 rounded-lg px-4 py-3 text-lg h-48"
                    placeholder="Tell us about yourself or your business"
                  />
                )}
              </div>

              <div className="flex gap-4">
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-8 py-3 bg-indigo-600 text-white text-lg rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <>
                    <button
                      onClick={handleSubmit}
                      className="px-8 py-3 bg-green-600 text-white text-lg rounded-xl hover:bg-green-700 transition-colors shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-8 py-3 bg-gray-200 text-gray-700 text-lg rounded-xl hover:bg-gray-300 transition-colors shadow-lg"
                    >
                      Cancel
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
