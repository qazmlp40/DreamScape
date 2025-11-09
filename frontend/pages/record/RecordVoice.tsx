import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'

const RecordVoice = () => {
    return (
        <View style={styles.container}>
            <View style={styles.icon_container}>
            </View>
            <Text style={styles.voice_record_text}>오늘은 어떤 꿈을 꾸었나요?</Text>
        </View>
    )
}

export default RecordVoice

const styles = StyleSheet.create({
    container: {
        width: "100%",
        height: "100%",
        backgroundColor: '#EBEBEB',
        justifyContent: "center",
        alignItems: "center"
    },
    icon_container: {
        width: 140,
        height: 140,
        backgroundColor: "#BB7CFF",
        borderRadius: 70,
        marginBottom: 44
    },
    voice_record_text: {
        color: "#BB7CFF",
        fontSize: 24,
        fontFamily: "Roboto-Nomal",
        fontWeight: 700
    }
})