import './Board.css'
import yellowPiece from '../../assets/yellow_piece.png';
import redPiece from '../../assets/red_piece.png';
const Slot = ({ch, y, x}) => {
    return (
        <>
            <div className={"slot"} x={x} y={y}>
                {ch && (
                    <img src={ch === "X" ? yellowPiece : redPiece} width={'100%'}height={'100%'}/>
                )}
            </div>
        </>
    )
}

export default Slot