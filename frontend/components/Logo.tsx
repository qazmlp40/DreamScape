import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Logo = () => {
  return (
    <View style={styles.logo}>
      <Text>로고 들어갈 자리</Text>
    </View>
  )
}

export default Logo

const styles = StyleSheet.create({
    logo: {
        width: 120,
        height: 120,
        backgroundColor: "#D9D9D9"
      },
})