import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useScale from '../../hooks/useScale'
import { TouchableOpacity } from 'react-native'

const Profile_Menu_Btn = ({icon, label, onPress}) => {
  const { s } = useScale();

  return (
    <View>
      <TouchableOpacity style={[styles.btn, {width: s(380), height: s(56), padding: s(16)}]} onPress={onPress}>
        <View>
          {icon}
        </View>
        <Text style={[styles.label, {fontSize: s(14)}]}>
          {label}
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Profile_Menu_Btn

const styles = StyleSheet.create({
  btn: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center", 
    borderRadius: 16,
    backgroundColor: '#FFF',

    // iOS Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.06,
    shadowRadius: 5,

    // Android Shadow
    elevation: 5,
  },
  label: {
    color: "#282828",
    fontFamily: "Roboto-Nomal",
    fontWeight: 400
  }
})