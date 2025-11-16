import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import useScale from '../hooks/useScale';

interface Props { 
  onPress?: () => void;   
  disabled?: boolean;     
  title?: string;         
}

const CompleteBtn = ({onPress, disabled = false, title}) => {
  const { s } = useScale();

  return (
      <TouchableOpacity
        activeOpacity={disabled ? 1 : 0.8}        
        style={[styles.button, disabled ? styles.button_disabled : styles.button_active, {height: s(60)}]}
        onPress={disabled ? undefined : onPress}  
      >
        <Text style={styles.text}>{title}</Text>
      </TouchableOpacity>
  )
}

export default React.memo(CompleteBtn);

const styles = StyleSheet.create({
    button: { 
      width: "100%",
      // height: 60,
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
      fontWeight: '700',
    }
})