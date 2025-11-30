import { StyleSheet, Text, TextInput, View } from 'react-native'
import React, { useState } from 'react'
import useScale from '../../hooks/useScale'

const Input = ({value, setValue, placeholder, secureTextEntry = false, multiline = false, style}) => {
  const { s } = useScale();

  return (
    <View>
      <TextInput 
      onChangeText={setValue}
      value={value}
      placeholder={placeholder}
      secureTextEntry = {secureTextEntry}
      multiline={multiline}
      style={[
        styles.input,
        { paddingHorizontal: s(16), paddingVertical: s(20) },
        multiline && { textAlignVertical: 'top' }, // 여러 줄일 때 위부터 시작
        style, // 마지막에 외부에서 넘긴 style 덮어쓰기 가능
      ]}
      />
    </View>
  )
}

export default React.memo(Input);

const styles = StyleSheet.create({
  input: {
    width: "100%",
    boxShadow: "0px 0px 1.5px rgba(0, 0, 0, 0.25)",
    flexDirection: "row",
    alignItems: "center",
    // paddingHorizontal: 16,
    // paddingVertical: 18,

    fontSize: 16,
    fontFamily: "Roboto-Nomal",
    color: "#808991",
    textAlign: "left",
    fontWeight: '400',
    borderRadius: 8
    }
    
})
