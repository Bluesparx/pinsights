import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import background from '../assets/background.png';

const Review = () => {
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [accessToken, setAccessToken] = useState(null);

  useEffect(() => {
    const storedToken = sessionStorage.getItem('accessToken');
    setAccessToken(storedToken);
  }, []);

  useEffect(() => {
    const fetchReview = async () => {
      console.log('Review page mounted. Access token present:', !!accessToken);

      if (!accessToken) {
        setError('Access token is required. Please login first.');
        return;
      }

      setLoading(true);
      setError('');

      try {
        console.log('Sending review request to backend...');
        const response = await axios.post(`${import.meta.env.VITE_BACKEND}/fetch`, {
          accessToken,
        });

        console.log('Review response:', response.data);

        if (response.data) {
          setReview(response.data);
        } else {
          throw new Error('No review data received');
        }
      } catch (err) {
        console.error('Error fetching review:', err);
        setError(
          err.response?.data?.error ||
          err.response?.data?.details ||
          err.message ||
          'Unable to generate review. Please try again later.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchReview();
    }
  }, [accessToken]);

  const backgroundStyle = {
    backgroundImage: `url(${background})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    height: '100vh',
    width: '100%',
  };

  if (loading) {
    return (
      <div style={backgroundStyle}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-black/20">
        <div className="flex flex-col items-center justify-center bg-black rounded-lg p-4 max-w-md w-full">
          <Loader2 className="h-8 w-8 animate-spin text-pink-400 my-2" />
          <div className="text-center space-y-2">
            <p className="text-lg font-medium text-white">Analyzing your Pinterest boards...</p>
            <p className="text-sm text-gray-100 pb-2">
              This may take a few minutes as we process your pins
            </p>
          </div>
        </div>
        <Footer/>
      </div>

      </div>
    );
  }

  if (error) {
    return (
      <div style={backgroundStyle}>
        <Navbar />
        <div className="flex items-center justify-center min-h-screen bg-black/20">
        <div className="flex flex-col items-center justify-center my-4 bg-black/80 rounded-lg p-4 max-w-md w-full">
            <h3 className="text-gray-100 font-medium mb-2">Error analysing pins. Please try again later</h3>
            <p className="text-sm text-gray-300 text-center whitespace-pre-wrap">{error}</p>
        </div>
        </div>
        <Footer/>
      </div>
    );
  }

  // const testreview = "hi Lorem ipsum dolor, sit amet consectetur adipisicing elit. Officia aperiam fuga eius odio animi sint pariatur! Dolorum error, sit laboriosam maiores quas voluptatibus aliquid est aut corporis vel amet quisquam. Incidunt, et! Maiores quibusdam neque alias praesentium, architecto minima molestias atque perferendis consequatur omnis quia consequuntur illum possimus dignissimos? Praesentium, minus in. Qui corporis a vero minima consectetur. Molestiae assumenda esse placeat facilis incidunt? Omnis ullam, doloribus est veniam magnam ipsum dicta ad natus nobis inventore nisi? Nisi, veniam adipisci sint ipsum officia pariatur harum asperiores tempore a vero voluptates, nostrum aperiam iusto ab necessitatibus, debitis illo autem mollitia reprehenderit!"
  return (
    <>
      <Navbar/>
      <div style={backgroundStyle} className="flex items-center justify-center min-h-screen">
        <div className="mx-auto p-6 max-w-2xl">
          <div className="bg-black/80 backdrop-blur-lg rounded-lg overflow-hidden">
            <div className="bg-gradient-to-r from-red-500/50 to-pink-600/50 p-4">
              <h2 className="text-white text-2xl font-semibold text-center font-[Ariel]">
                Your Pinterest Analysis
              </h2>
            </div>

            <div className="p-6">
              {review ? (
                <div className="max-w-none">
                  <p className="text-gray-100 p-2 leading-relaxed whitespace-pre-line font-[Ariel] text-lg">
                    {review}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center mx-4 p-2">
                  <p className="text-gray-100 text-center italic mb-4 mx-4 font-[Ariel]">
                    Please login to get review.
                  </p>
                  <Link
                    to="/"
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full w-full max-w-xs text-center transition duration-200"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer/>
      </div>
    </>
  );
};

export default Review;
