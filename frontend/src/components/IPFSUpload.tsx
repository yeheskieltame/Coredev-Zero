'use client'

import { useState, useRef } from 'react'
import { Upload, File, Image, Check, X, ExternalLink } from 'lucide-react'
import { showError, showLoading, updateToast } from '@/lib/contract-utils'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  ipfsHash: string
  url: string
  uploadDate: Date
}

interface IPFSUploadProps {
  onUpload?: (file: UploadedFile) => void
  acceptedTypes?: string[]
  maxSize?: number // in MB
}

export function IPFSUpload({ 
  onUpload, 
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', 'application/json'],
  maxSize = 10 
}: IPFSUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock IPFS upload function - replace with real implementation
  const uploadToIPFS = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock IPFS hash
        const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`
        resolve(mockHash)
      }, 2000 + Math.random() * 3000) // Simulate 2-5 second upload
    })
  }

  const handleFileUpload = async (filesToUpload: FileList | null) => {
    if (!filesToUpload) return

    const validFiles = Array.from(filesToUpload).filter(file => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        showError(`File "${file.name}" is too large. Maximum size is ${maxSize}MB.`)
        return false
      }

      // Check file type
      const isValidType = acceptedTypes.some(type => {
        if (type.endsWith('/*')) {
          return file.type.startsWith(type.slice(0, -1))
        }
        return file.type === type
      })

      if (!isValidType) {
        showError(`File "${file.name}" type is not supported.`)
        return false
      }

      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)
    
    for (const file of validFiles) {
      const toastId = showLoading(`Uploading ${file.name} to IPFS...`)
      
      try {
        const ipfsHash = await uploadToIPFS(file)
        const uploadedFile: UploadedFile = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: file.name,
          size: file.size,
          type: file.type,
          ipfsHash,
          url: `https://ipfs.io/ipfs/${ipfsHash}`,
          uploadDate: new Date()
        }

        setFiles(prev => [...prev, uploadedFile])
        onUpload?.(uploadedFile)
        
        updateToast(toastId, `${file.name} uploaded successfully!`, 'success')
      } catch (error) {
        console.error('Upload failed:', error)
        updateToast(toastId, `Failed to upload ${file.name}`, 'error')
      }
    }
    
    setUploading(false)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <Image className="w-5 h-5 text-blue-400" />
    }
    return <File className="w-5 h-5 text-gray-400" />
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5" />
          <span>IPFS File Upload</span>
        </h3>
        
        <div
          className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
            dragActive
              ? 'border-cyan-400 bg-cyan-400/10'
              : 'border-white/30 hover:border-white/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={acceptedTypes.join(',')}
            onChange={(e) => handleFileUpload(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          
          <div className="space-y-4">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <p className="text-white text-lg font-semibold mb-2">
                {dragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
              </p>
              <p className="text-gray-300 text-sm">
                Supported formats: Images, PDFs, Text files, JSON
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Maximum file size: {maxSize}MB
              </p>
            </div>
            
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-500 hover:to-blue-600 transition-all duration-300 disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Select Files'}
            </button>
          </div>
        </div>
      </div>

      {/* Upload Progress & File List */}
      {files.length > 0 && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">
            Uploaded Files ({files.length})
          </h4>
          
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file.type)}
                  <div className="flex-1">
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">
                      {formatFileSize(file.size)} • {file.uploadDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Uploaded</span>
                  </div>
                  
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1 text-gray-400 hover:text-cyan-400 transition-colors"
                    title="View on IPFS"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  
                  <button
                    onClick={() => removeFile(file.id)}
                    className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* IPFS Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-blue-400 mb-2">ℹ️ About IPFS</h4>
        <p className="text-xs text-gray-300">
          Files are uploaded to the InterPlanetary File System (IPFS), a distributed storage network. 
          Each file gets a unique hash that serves as its permanent address. Currently using mock implementation 
          - integrate with Helia or Pinata for production.
        </p>
      </div>
    </div>
  )
}

// NFT Metadata Upload Component
interface NFTMetadata {
  name: string
  description: string
  image: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  external_url?: string
  animation_url?: string
}

interface NFTMetadataUploadProps {
  onMetadataUpload?: (metadata: NFTMetadata, ipfsHash: string) => void
}

export function NFTMetadataUpload({ onMetadataUpload }: NFTMetadataUploadProps) {
  const [metadata, setMetadata] = useState<NFTMetadata>({
    name: '',
    description: '',
    image: '',
    attributes: []
  })
  const [uploading, setUploading] = useState(false)
  const [uploadedHash, setUploadedHash] = useState<string>('')

  const addAttribute = () => {
    setMetadata(prev => ({
      ...prev,
      attributes: [...prev.attributes, { trait_type: '', value: '' }]
    }))
  }

  const updateAttribute = (index: number, field: 'trait_type' | 'value', value: string) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.map((attr, i) => 
        i === index ? { ...attr, [field]: value } : attr
      )
    }))
  }

  const removeAttribute = (index: number) => {
    setMetadata(prev => ({
      ...prev,
      attributes: prev.attributes.filter((_, i) => i !== index)
    }))
  }

  const uploadMetadata = async () => {
    if (!metadata.name || !metadata.description) {
      showError('Please fill in required fields (name and description)')
      return
    }

    setUploading(true)
    const toastId = showLoading('Uploading NFT metadata to IPFS...')

    try {
      // Create metadata JSON blob
      const metadataJson = JSON.stringify(metadata, null, 2)
      const blob = new Blob([metadataJson], { type: 'application/json' })
      
      // Mock upload to IPFS
      await new Promise(resolve => setTimeout(resolve, 2000))
      const mockHash = `Qm${Math.random().toString(36).substr(2, 44)}`
      
      setUploadedHash(mockHash)
      onMetadataUpload?.(metadata, mockHash)
      
      updateToast(toastId, 'NFT metadata uploaded successfully!', 'success')
    } catch (error) {
      console.error('Metadata upload failed:', error)
      updateToast(toastId, 'Failed to upload NFT metadata', 'error')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
          <Image className="w-5 h-5" />
          <span>NFT Metadata Generator</span>
        </h3>
        
        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">Name *</label>
              <input
                type="text"
                value={metadata.name}
                onChange={(e) => setMetadata(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="NFT Name"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">Image URL</label>
              <input
                type="url"
                value={metadata.image}
                onChange={(e) => setMetadata(prev => ({ ...prev, image: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="https://ipfs.io/ipfs/..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm mb-2">Description *</label>
            <textarea
              value={metadata.description}
              onChange={(e) => setMetadata(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              placeholder="Describe your NFT..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm mb-2">External URL</label>
              <input
                type="url"
                value={metadata.external_url || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, external_url: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="https://example.com"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm mb-2">Animation URL</label>
              <input
                type="url"
                value={metadata.animation_url || ''}
                onChange={(e) => setMetadata(prev => ({ ...prev, animation_url: e.target.value }))}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                placeholder="https://ipfs.io/ipfs/..."
              />
            </div>
          </div>

          {/* Attributes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-gray-300 text-sm">Attributes</label>
              <button
                onClick={addAttribute}
                className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
              >
                Add Attribute
              </button>
            </div>
            
            <div className="space-y-2">
              {metadata.attributes.map((attr, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={attr.trait_type}
                    onChange={(e) => updateAttribute(index, 'trait_type', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Trait Type"
                  />
                  <input
                    type="text"
                    value={attr.value}
                    onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                    className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
                    placeholder="Value"
                  />
                  <button
                    onClick={() => removeAttribute(index)}
                    className="p-2 text-red-400 hover:text-red-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={uploadMetadata}
            disabled={uploading || !metadata.name || !metadata.description}
            className="w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-500 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
          >
            {uploading ? 'Uploading...' : 'Upload Metadata to IPFS'}
          </button>
        </div>
      </div>

      {/* Metadata Preview & Result */}
      {(uploadedHash || Object.keys(metadata).some(key => metadata[key as keyof NFTMetadata])) && (
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6 border border-white/20">
          <h4 className="text-lg font-semibold text-white mb-4">Metadata Preview</h4>
          
          {uploadedHash && (
            <div className="mb-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-green-400 text-sm">
                ✅ Uploaded to IPFS: <code className="text-green-300">{uploadedHash}</code>
              </p>
              <p className="text-green-300 text-xs mt-1">
                URL: https://ipfs.io/ipfs/{uploadedHash}
              </p>
            </div>
          )}
          
          <pre className="bg-gray-900/50 p-4 rounded-lg text-gray-300 text-sm overflow-x-auto">
            {JSON.stringify(metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}
