import { useRef } from "react"

function ConfirmableModal({ title, message, onConfirm, children }) {

  const dialogRef = useRef()
  const openModal = () => { dialogRef.current.showModal()}

  const handleConfirm = () => {
    dialogRef.current.close()
    onConfirm()
  }

  return (
    <div>
      {/* Botón que abre el modal */}
      <span onClick={openModal}>{children}</span>

      <dialog ref={dialogRef} className="modal">
        <div className="modal-box">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="py-4">{message}</p>
          <div className="modal-action">
            <form method="dialog">
              <button className="btn">Cancelar</button>
            </form>
            <button className="btn btn-error" onClick={handleConfirm}>Confirmar</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default ConfirmableModal