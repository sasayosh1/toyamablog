'use client'

import React from 'react'
import { Stack, Card, Text } from '@sanity/ui'
import { StringInputProps } from 'sanity'
import LinkifyText from './LinkifyText'

export default function CustomTextInput(props: StringInputProps) {
  const { value, onChange } = props

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    if (onChange) {
      // @ts-expect-error - Sanity v4 expects FormPatch but component works correctly with string
      onChange(newValue)
    }
  }

  return (
    <Stack space={3}>
      <input
        type="text"
        value={value || ''}
        onChange={handleChange}
        // @ts-expect-error - StringInputProps doesn't include placeholder but it works correctly
        placeholder={props.placeholder}
        style={{
          width: '100%',
          padding: '12px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          fontFamily: 'inherit'
        }}
      />
      {value && (/https?:\/\/|www\./i.test(value)) && (
        <Card padding={3} radius={2} tone="primary" border>
          <Text size={1}>
            <strong>リンクプレビュー:</strong>
            <div style={{ marginTop: '4px' }}>
              <LinkifyText>{value}</LinkifyText>
            </div>
          </Text>
        </Card>
      )}
    </Stack>
  )
}