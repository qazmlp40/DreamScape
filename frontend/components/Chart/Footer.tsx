import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FooterIcon from '../../images/Chart_icons/footericon'
import useScale from '../../hooks/useScale'

const Footer = () => {
    const { s } = useScale();
  return (
    <View style={[styles.footer, {paddingHorizontal: s(32)}]}>
      <View style={styles.menu}>
        <FooterIcon />
        <Text style={[styles.text, {marginTop: s(7), fontSize: s(14)}]}> 홈 </Text>
      </View>
      <View style={styles.menu}>
        <FooterIcon />
        <Text style={[styles.text, {marginTop: s(7), fontSize: s(14)}]} > 캘린더 </Text>
      </View>
      <View style={styles.menu}>
        <FooterIcon />
        <Text style={{ color: '#BB7CFF', fontSize: s(14), fontWeight: '800', marginTop: s(7)}}> 차트 </Text>
      </View>
      <View style={styles.menu}>
        <FooterIcon />
        <Text style={[styles.text, {marginTop: s(7), fontSize: s(14)}]} > 프로필 </Text>
      </View>
    </View>
  )
}

export default Footer

const styles = StyleSheet.create({
    footer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: "space-between",
      },
      menu: {
        alignItems: 'center'
      },
      text: {
        color: '#D6D6D6',
        fontWeight: '500'
      }
})
