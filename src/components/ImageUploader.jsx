import { useState, useRef } from 'react'
import { uploadImage } from '../lib/cloudinary'

export default function ImageUploader({ images = [], onChange, accent = '#a07840', onUploadingChange }) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef()

  const handleFiles = async (files) => {
    const arr = Array.from(files).filter((f) => f.type.startsWith('image/'))
    if (!arr.length) return
    setUploading(true)
    onUploadingChange?.(true)
    try {
      const urls = await Promise.all(arr.map((file) => uploadImage(file)))
      onChange([...images, ...urls])
    } catch (e) {
      alert('이미지 업로드 실패: ' + e.message)
    } finally {
      setUploading(false)
      onUploadingChange?.(false)
    }
  }

  const removeImage = (idx) => {
    onChange(images.filter((_, i) => i !== idx))
  }

  return (
    <div>
      {images.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={url}
                alt=""
                style={{
                  width: '80px', height: '60px', objectFit: 'cover',
                  borderRadius: '6px', border: '1px solid rgba(0,0,0,0.1)', display: 'block',
                }}
              />
              <button
                type="button"
                onClick={() => removeImage(i)}
                style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  width: '18px', height: '18px', borderRadius: '50%',
                  background: '#c0392b', color: 'white', border: 'none',
                  fontSize: '10px', cursor: 'pointer', lineHeight: 1,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
                }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <label
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '5px',
          padding: '4px 12px', borderRadius: '6px',
          border: `1px dashed ${uploading ? '#d4cfc8' : accent}`,
          color: uploading ? '#a8a49e' : accent,
          fontSize: '12px', cursor: uploading ? 'not-allowed' : 'pointer',
          background: 'transparent', userSelect: 'none',
        }}
      >
        {uploading ? '업로드 중...' : '+ 이미지 추가'}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          disabled={uploading}
          onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
          style={{ display: 'none' }}
        />
      </label>
    </div>
  )
}
