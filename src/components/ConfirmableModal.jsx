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

      <dialog ref={dialogRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-h-[calc(100dvh-2rem)] w-[calc(100vw-1.5rem)] max-w-lg overflow-y-auto p-4 sm:w-11/12 sm:p-6">
          <h3 className="font-bold text-lg">{title}</h3>
          <p className="py-4 break-words">{message}</p>
          <div className="modal-action flex-col gap-2 sm:flex-row">
            <div className="w-full sm:w-auto">
              <button type="button" className="btn w-full sm:w-auto" onClick={closeModal}>Cancel·lar</button>
            </div>
            <button type="button" className="btn btn-error w-full sm:w-auto" onClick={handleConfirm}>Confirmar</button>
          </div>
        </div>
      </dialog>
    </div>
  )
}

export default ConfirmableModal
