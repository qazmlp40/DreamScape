import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'

interface Props { 
  onPress?: () => void;   
  disabled?: boolean;     
  title?: string;         
}

const CompleteBtn = ({onPress, disabled = false, title}) => {
  return (
    <View>
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.8}        
        style={[styles.button, disabled ? styles.button_disabled : styles.button_active]}
        onPress={disabled ? undefined : onPress}  
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default CompleteBtn

const styles = StyleSheet.create({
    button: { 
      width: "100%",
      height: 60,
      borderRadius: 8,
      justifyContent: "center",
      alignItems: "center"
    }, 
    button_active: {
      backgroundColor: "#BB7CFF",   
    },
    button_disabled: {
      backgroundColor: "#CACACA",   
    },
    text: {
      fontSize: 18,
      fontFamily: "Roboto-Regular",
      color: "#FFF",
      textAlign: "center",
      fontWeight: 700,
    }
})