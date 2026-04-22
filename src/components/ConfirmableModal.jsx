import { useRef } from "react"

function ConfirmableModal({ title, message, onConfirm, children }) {

  const dialogRef = useRef()
  const openModal = (event) => {
    event.preventDefault()
    event.stopPropagation()
    dialogRef.current.showModal()
  }

  const handleConfirm = (event) => {
    event.preventDefault()
    event.stopPropagation()
    dialogRef.current.close()
    onConfirm()
  }

  const closeModal = (event) => {
    event.preventDefault()
    event.stopPropagation()
    dialogRef.current.close()
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
            <div>
              <button type="button" className="btn" onClick={closeModal}>Cancel·lar</button>
            </div>
            <button type="button" className="btn btn-error" onClick={handleConfirm}>Confirmar</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default ConfirmableModal
