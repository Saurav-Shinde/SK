import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import Layout from '../components/Layout'
import { authUtils } from '../utils/auth'
import api from '../utils/api';

const SignUp = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    companyName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    // Clear error for this field
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: ''
      })
    }
  }

  const validate = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setLoading(true)
    setStatus({ type: '', message: '' })

    try {
      const { data } = await api.post('/api/auth/signup', {
        name: formData.name,
        companyName: formData.companyName,
        email: formData.email,
        password: formData.password
      })

      authUtils.setAuth(data.token, data.user)
      setStatus({ type: 'success', message: 'Account created! Redirecting...' })
      setTimeout(() => navigate('/eligibility-form'), 600)
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Unable to create account. Please try again.'
      setStatus({ type: 'error', message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className=" text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Skope Kitchens</h1>
            <h2 className="text-2xl font-semibold text-gray-900">Create Your Account</h2>
          </div>

          <div className="bg-[url('../assets/Main-bg.png')] bg-cover bg-center bg-no-repeat card">
            <form onSubmit={handleSubmit} className="space-y-6">
              {status.message && (
                <div
                  className={`px-4 py-3 rounded-lg text-sm ${
                    status.type === 'success'
                      ? 'bg-green-50 border border-green-200 text-green-700'
                      : 'bg-red-50 border border-red-200 text-red-700'
                  }`}
                >
                  {status.message}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="Enter your full name"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-900 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.companyName ? 'border-red-500' : ''}`}
                  placeholder="Enter your company name"
                />
                {errors.companyName && (
                  <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                )}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.email ? 'border-red-500' : ''}`}
                  placeholder="Enter your email"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.password ? 'border-red-500' : ''}`}
                  placeholder="Create a password"
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`input-field ${errors.confirmPassword ? 'border-red-500' : ''}`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="relative w-full inline-flex items-center justify-center btn-primary text-white bg-black hover:bg-black hover:text-white disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
              >
                {loading ? (
                  // No animation while loading
                  <span>Creating Account...</span>
                ) : (
                  // Slide-up / slide-in animation (same as your Link)
                  <span className="relative block overflow-hidden">
                    <span className="block transition-transform duration-300 group-hover:-translate-y-full">
                      <span className="block">Create Account</span>
                    </span>
                    <span className="absolute inset-0 flex items-center justify-center translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      Create Account
                    </span>
                  </span>
                )}
              </button>

            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-black hover:text-white font-medium">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SignUp

