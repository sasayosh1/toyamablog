'use client'

import React from 'react'
import { Stack, Card, Text } from '@sanity/ui'
import { TextInputProps } from 'sanity'
import LinkifyText from './LinkifyText'

export default function CustomTextareaInput(props: TextInputProps) {
  const { value, onChange } = props

  return (
    <Stack space={3}>
      <textarea
        value={value || ''}
        onChange={(event) => onChange && onChange(event.target.value)}
        placeholder={props.placeholder}
        rows={props.rows || 4}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '100px'
        }}
      />
      {value && (/https?:\/\/|www\./i.test(value)) && (
        <Card padding={3} radius={2} tone="primary" border>
          <Text size={1}>
            <strong>リンクプレビュー:</strong>
            <div style={{ marginTop: '4px', maxHeight: '150px', overflow: 'auto' }}>
              <LinkifyText>{value}</LinkifyText>
            </div>
          </Text>
        </Card>
      )}
    </Stack>
  )
}