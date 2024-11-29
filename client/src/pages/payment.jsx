
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { FaCreditCard, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Payment = () => {
  const [bookingData, setBookingData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [movieCost, setMovieCost] = useState(0);
  const [parkingCost, setParkingCost] = useState(0);

  const [localParkingDetails, setLocalParkingDetails] = useState({
    selectedSlot: { twoWheeler: 'N/A', fourWheeler: 'N/A' },
    vehicleNumber: '', // Default empty vehicle number
  });

  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  // Define parking costs
  const twoWheelerCost = 20;
  const fourWheelerCost = 30;

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem('bookingData'));

    if (data) {
      setBookingData(data);

      // Calculate movie cost and parking cost separately
      const calculatedMovieCost = data.totalCost || 0;
      setMovieCost(calculatedMovieCost);

      let calculatedParkingCost = 0;
      if (data.parkingDetails) {
        if (data.parkingDetails.parkingType === 'Two-Wheeler') {
          calculatedParkingCost = twoWheelerCost;
        } else if (data.parkingDetails.parkingType === 'Four-Wheeler') {
          calculatedParkingCost = fourWheelerCost;
        }
        setLocalParkingDetails({
          selectedSlot: data.parkingDetails.selectedSlot || { twoWheeler: 'N/A', fourWheeler: 'N/A' },
          vehicleNumber: data.parkingDetails.vehicleNumber || '',
        });
      }
      setParkingCost(calculatedParkingCost);
    }
  }, []);

  const handlePayment = async () => {
    if (!bookingData) {
      Swal.fire({
        icon: 'error',
        title: 'No booking data!',
        text: 'There was an issue fetching your booking data. Please try again.',
        confirmButtonText: 'OK',
      });
      return;
    }

    if (!currentUser) {
      Swal.fire({
        icon: 'error',
        title: 'User not logged in!',
        text: 'Please log in to complete the payment.',
        confirmButtonText: 'OK',
      });
      return;
    }

    setIsLoading(true);
    try {
      const paymentData = {
        ...bookingData,
        userEmail: currentUser.email,
        parkingDetails: {
          ...bookingData.parkingDetails,
          vehicleNumber: localParkingDetails.vehicleNumber,
        },
      };

      const response = await axios.post('/api/confirm-payment', { bookingData: paymentData });

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Payment Confirmed!',
          text: 'Your payment has been successfully processed and a confirmation email has been sent.',
          confirmButtonText: 'OK',
        });

        localStorage.removeItem('bookingData');
        navigate('/'); // Redirect to a confirmation page or homepage
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed!',
          text: 'There was an error processing your payment. Please try again.',
          confirmButtonText: 'OK',
        });
      }
    } catch (error) {
      console.error('Error during payment confirmation:', error);
      Swal.fire({
        icon: 'error',
        title: 'Payment Failed!',
        text: 'An error occurred while processing the payment.',
        confirmButtonText: 'OK',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = movieCost + parkingCost;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex justify-center items-center p-6">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg transform transition-all hover:scale-105 hover:shadow-2xl">
        <h1 className="text-4xl font-semibold text-center text-yellow-600 mb-6">Confirm Payment</h1>
        {currentUser && (
          <div className="text-center text-lg mb-4 text-green-500">
            <p>Welcome, {currentUser.email}</p>
          </div>
        )}

        <div className="text-gray-800">
          {bookingData ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-semibold">Booking Details</h2>
                <p><strong>Movie Title:</strong> {bookingData.movie}</p>
                <p><strong>Screen:</strong> {bookingData.screen}</p>
                <p><strong>Show Timing:</strong> {bookingData.timing}</p>
                <p><strong>Selected Seats:</strong> {bookingData.seats.join(', ')}</p>

                {bookingData.parkingDetails && (
                  <div className="mt-4">
                    <h3 className="text-lg font-semibold">Parking Details</h3>
                    <p><strong>Two-Wheeler Slot:</strong> {localParkingDetails.selectedSlot?.twoWheeler || 'N/A'}</p>
                    <p><strong>Four-Wheeler Slot:</strong> {localParkingDetails.selectedSlot?.fourWheeler || 'N/A'}</p>
                    <p><strong>Two-Wheeler Vehicle Numbers:</strong> {bookingData.parkingDetails.vehicleNumbers?.twoWheeler?.join(', ') || 'N/A'}</p>
                                       <p><strong>Four-Wheeler Vehicle Numbers:</strong> {bookingData.parkingDetails.vehicleNumbers?.fourWheeler?.join(', ') || 'N/A'}</p>
                  </div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-semibold">Cost Breakdown</h3>
                <div className="flex justify-between text-lg">
                  <p>Movie Seat Cost:</p>
                  <p>${movieCost}</p>
                </div>

                {parkingCost > 0 && (
                  <div className="flex justify-between text-lg mt-2">
                    <p>Parking Cost:</p>
                    <p>${parkingCost}</p>
                  </div>
                )}

                <div className="mt-4 flex justify-between text-2xl font-bold">
                  <p>Total Amount:</p>
                  <p>${totalAmount}</p>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <button
                  onClick={handlePayment}
                  className={`bg-green-500 py-3 px-8 rounded-lg text-white font-bold text-lg flex items-center gap-2 ${
                    isLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin">
                        <FaCreditCard />
                      </div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <FaCreditCard />
                      Confirm Payment
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            <p className="text-center text-lg text-red-500">Booking data is missing!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
