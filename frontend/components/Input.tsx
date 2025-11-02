import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

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
  return (
    <View>
      <TextInput 
      style={[styles.input, error && styles.input_error]}
      onChangeText={setValue}
      value={value}
      placeholder={placeholder}
      secureTextEntry = {secureTextEntry}
      />
    </View>
  )
}

export default Input

const styles = StyleSheet.create({
  input: {
    width: "100%",
    boxShadow: "0px 0px 1.5px rgba(0, 0, 0, 0.25)",
    
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
    }, 
    input_error: {
      width: "100%",
      borderColor: "#FF3D3D",
      borderWidth: 1,  
      boxShadow: "0px 0px 1.5px rgba(0, 0, 0, 0.25)",
      elevation: 2,
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 20,
      borderRadius: 8
    }
})