import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import React from 'react'
import { MaterialIcons } from "@expo/vector-icons";
import useScale from '../hooks/useScale';

const CheckBtn = ({checked, setChecked}) => {
    const { s } = useScale();

    return (
        <View>
        <TouchableOpacity activeOpacity={0.8} onPress={()=>setChecked(!checked)}>
            <View style={[styles.circle, checked? styles.on : styles.off, {width: s(24), height: s(24)}]}>
                {checked && <MaterialIcons name="check" size={s(17)} color="#FFF" />}
                {!checked && <MaterialIcons name="check" size={s(17)} color="##282828" />}
            </View>
        </TouchableOpacity>
        </View>
    )
    }

export default React.memo(CheckBtn);

    const styles = StyleSheet.create({
        circle: {
            // width: 24,
            // height: 24,
            borderRadius: 50,
            justifyContent: "center",
            alignItems: "center"
        },
        off: {
            backgroundColor: '#fff',
            borderWidth: 1.5, 
            borderColor: '#282828' 
        },
        on: { 
            backgroundColor: '#BB7CFF',
        borderColor: "#BB7CFF" },
    })