'use client'

import { lazy } from 'react'

// Lazy load heavy components
export const LazyTanahGarapanForm = lazy(() => 
  import('@/components/tanah-garapan/tanah-garapan-form').then(module => ({
    default: module.TanahGarapanForm
  }))
)

export const LazyTanahGarapanTable = lazy(() => 
  import('@/components/tanah-garapan/tanah-garapan-table').then(module => ({
    default: module.TanahGarapanTable
  }))
)

export const LazyAdvancedSearch = lazy(() => 
  import('@/components/tanah-garapan/advanced-search').then(module => ({
    default: module.AdvancedSearch
  }))
)

export const LazyExportButton = lazy(() => 
  import('@/components/tanah-garapan/export-button').then(module => ({
    default: module.ExportButton
  }))
)

export const LazyUserForm = lazy(() => 
  import('@/components/users/user-form').then(module => ({
    default: module.UserForm
  }))
)

export const LazyUserActions = lazy(() => 
  import('@/components/users/user-actions').then(module => ({
    default: module.UserActions
  }))
)

export const LazyFilePreview = lazy(() => 
  import('@/components/shared/file-preview').then(module => ({
    default: module.FilePreview
  }))
)

export const LazyFileUpload = lazy(() => 
  import('@/components/shared/file-upload').then(module => ({
    default: module.FileUpload
  }))
)

