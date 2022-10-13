export const initialState = null;

export const reducer =(state, action)=>{
    if(action.type === 'USER'){
        return action.payload;
    }
    if(action.type === 'CLEAR'){
        return null;
    }
    if(action.type == 'UPDATE_PROFILE_PIC'){
        return {
            ...state,
            profile_pic : action.payload
        }
    }
    return state;
}