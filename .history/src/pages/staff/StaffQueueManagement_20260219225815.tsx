return (
  <div className="min-h-screen bg-white">
    <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        ...
      </div>

      {/* Main Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">

        {/* Left Column */}
        <div className="space-y-6">

          {/* Waiting Queue List */}
          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ borderWidth: "2px", borderColor: "#BEBEBE" }}
          >
            <div
              className="py-3 text-center"
              style={{ backgroundColor: "#FFAE3C" }}
            >
              <p className="text-white font-bold flex items-center justify-center gap-2">
                <Hourglass className="w-5 h-5" />
                คิวที่รออยู่
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {waitingQueues.map((queue) => (
                  <div
                    key={queue.queueId}
                    className="bg-white rounded-3xl px-4 sm:px-6 py-4 border-2 border-gray-200 hover:border-teal-300 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div
                        className="text-3xl sm:text-4xl font-bold text-gray-800"
                        style={{ color: "#044C72" }}
                      >
                        {queue.queueNumber}
                      </div>

                      <div className="flex-1 sm:mx-6">
                        <p className="font-bold text-gray-800 text-lg">
                          {queue.patientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          VN{queue.vn.split("-").pop()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tel: {queue.phoneNumber}
                        </p>
                      </div>

                      {!currentCalledQueue && (
                        <button
                          onClick={() => handleCallQueue(queue)}
                          className="text-white w-full sm:w-auto px-6 py-3 rounded-full font-bold flex items-center justify-center shadow-md text-lg"
                          style={{ backgroundColor: "#87E74B" }}
                        >
                          <Bell className="w-5 h-5 mr-2" />
                          เรียก
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Current Queue Buttons */}
          {currentCalledQueue && (
            <>
              {currentCalledQueue.status === "called" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  ...
                </div>
              )}
            </>
          )}

          {/* Skipped Queues */}
          <div
            className="bg-white rounded-2xl shadow-xl overflow-hidden"
            style={{ borderWidth: "2px", borderColor: "#BEBEBE" }}
          >
            <div
              className="py-3 text-center"
              style={{ backgroundColor: "#FF4C4C" }}
            >
              <p className="text-white font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" />
                คิวที่ถูกข้าม
              </p>
            </div>

            <div className="p-6">
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {skippedQueues.map((queue) => (
                  <div
                    key={queue.queueId}
                    className="bg-white rounded-3xl px-4 sm:px-6 py-4 border-2 border-gray-200 hover:border-red-300 transition-colors shadow-sm"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                      <div
                        className="text-3xl sm:text-4xl font-bold"
                        style={{ color: "#044C72" }}
                      >
                        {queue.queueNumber}
                      </div>

                      <div className="flex-1 sm:mx-6">
                        <p className="font-bold text-gray-800 text-lg">
                          {queue.patientName}
                        </p>
                        <p className="text-sm text-gray-500">
                          VN{queue.vn.split("-").pop()}
                        </p>
                        <p className="text-sm text-gray-500">
                          Tel: {queue.phoneNumber}
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          handleRecallSkipped(queue.queueId)
                        }
                        className="text-white w-full sm:w-auto px-6 py-3 rounded-full font-bold flex items-center justify-center shadow-md text-lg"
                        style={{ backgroundColor: "#87E74B" }}
                      >
                        <Bell className="w-5 h-5 mr-2" />
                        คิวถัดไป
                      </button>

                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
);
