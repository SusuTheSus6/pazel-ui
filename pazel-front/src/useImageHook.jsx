import { useEffect, useState } from 'react'

const useImage = (path) => {
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [image, setImage] = useState(null)
    useEffect(() => {
        const fetchImage = async () => {
            try {
				console.log(path)
                const response = await import(path) // change relative path to suit your needs
                setImage(response.default)
            } catch (err) {
                setError(err)
            } finally {
                setLoading(false)
            }
        }

        fetchImage()
    }, [path])

    return {
        loading,
        error,
        image,
    }
}

export default useImage