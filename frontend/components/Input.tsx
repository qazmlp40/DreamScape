import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'
import useScale from '../hooks/useScale'

type error = {
  width: "100%",
  boxShadow: "0px 0px 1.5px rgba(255, 0, 0, 0.89)",
  elevation: 2,
  height: 60,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 20,

  fontSize: 14,
  fontFamily: "Roboto-Regular",
  color: "#999",
  textAlign: "left",
  fontWeight: 400,
  borderRadius: 8
}

const Input = ({value, setValue, placeholder, secureTextEntry, error }) => {
  const { s } = useScale();

  return (
    <View>
      <TextInput 
      style={[styles.input, error && styles.input_error, {paddingHorizontal: s(16), paddingVertical: s(20)}]}
      onChangeText={setValue}
      value={value}
      placeholder={placeholder}
      secureTextEntry = {secureTextEntry}
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

    fontSize: 14,
    fontFamily: "Roboto-Nomal",
    color: "#999",
    textAlign: "left",
    fontWeight: '400',
    borderRadius: 8
    }, 
    input_error: {
      width: "100%",
      borderColor: "#FF3D3D",
      borderWidth: 1,  
      boxShadow: "0px 0px 1.5px rgba(0, 0, 0, 0.25)",
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderRadius: 8
    }
})