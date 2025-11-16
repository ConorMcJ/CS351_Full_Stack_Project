from difflib import SequenceMatcher
from .trie import Trie


class FuzzyMatcher:
    """
    Fuzzy matching engine using Trie and ID-DFS for answer validation
    """

    def __init__(self, acceptable_answers, tolerance=0.8):
        """
        Initialize fuzzy matcher

        Args:
            acceptable_answers: List of correct answer strings
            tolerance: Minimum similarity ratio (0.0-1.0)
        """
        self.trie = Trie()
        self.trie.build_from_answers(acceptable_answers)
        self.acceptable_answers = acceptable_answers
        self.tolerance = tolerance

    def is_valid_answer(self, user_answer):
        """
        Validate user answer using multiple strategies

        Args:
            user_answer: User's submitted answer

        Returns:
            Tuple: (is_correct: bool, matched_answer: str, confidence: float)
        """
        user_answer_clean = user_answer.lower().strip()

        # Strategy 1: Exact Match (Fastest)
        for answer in self.acceptable_answers:
            if user_answer_clean == answer.lower().strip():
                return True, answer, 1.0

        # Strategy 2: Prefix Match via Trie
        prefix_matches = self.trie.search_prefix(user_answer_clean)
        if prefix_matches:
            return True, prefix_matches[0], 0.95

        # Strategy 3: Iterative Deepening DFS for Fuzzy Matching
        result = self._iterative_deepening_fuzzy_search(
            user_answer_clean, 
            self.acceptable_answers,
            max_depth=3
        )

        if result:
            matched_answer, confidence = result
            if confidence >= self.tolerance:
                return True, matched_answer, confidence

        return False, None, 0.0

    def _iterative_deepening_fuzzy_search(self, user_answer, answers, max_depth=3):
        """
        Search for matching answer using iterative deepening DFS

        This approach performs DFS with increasing depth limits:
        - Depth 1: Substring matching
        - Depth 2: One character edit distance
        - Depth 3: Two character edit distance

        Args:
            user_answer: User's answer to match
            answers: List of acceptable answers
            max_depth: Maximum search depth (edit distance limit)

        Returns:
            Tuple: (matched_answer, confidence) or None
        """

        # Try increasing depth limits
        for depth_limit in range(1, max_depth + 1):
            result = self._dfs_fuzzy_search(
                user_answer,
                answers,
                depth=0,
                max_depth=depth_limit
            )

            if result:
                return result

        return None

    def _dfs_fuzzy_search(self, user_answer, answers, depth, max_depth):
        """
        Recursive DFS for fuzzy matching with depth limit

        Args:
            user_answer: User's answer
            answers: List of acceptable answers
            depth: Current search depth (edit distance)
            max_depth: Maximum allowed depth

        Returns:
            Tuple: (matched_answer, confidence) or None
        """

        if depth > max_depth:
            return None

        # Check similarity at current depth
        for answer in answers:
            similarity = self._calculate_similarity(user_answer, answer)

            # At depth 0, require high similarity
            if depth == 0 and similarity >= 0.90:
                return (answer, similarity)

            # At depth 1-2, allow more tolerance
            if depth > 0 and similarity >= (0.80 - 0.05 * depth):
                return (answer, similarity)

        # Recursive calls for deeper searches (edit operations)
        # Depth 1: Single character operations
        if depth == 0:
            # Try character substitutions
            for i in range(len(user_answer)):
                for c in 'abcdefghijklmnopqrstuvwxyz ':
                    if c != user_answer[i]:
                        modified = user_answer[:i] + c + user_answer[i+1:]
                        result = self._dfs_fuzzy_search(
                            modified, answers, depth + 1, max_depth
                        )
                        if result:
                            return result

            # Try insertions
            for i in range(len(user_answer) + 1):
                for c in 'abcdefghijklmnopqrstuvwxyz ':
                    modified = user_answer[:i] + c + user_answer[i:]
                    result = self._dfs_fuzzy_search(
                        modified, answers, depth + 1, max_depth
                    )
                    if result:
                        return result

            # Try deletions
            for i in range(len(user_answer)):
                modified = user_answer[:i] + user_answer[i+1:]
                result = self._dfs_fuzzy_search(
                    modified, answers, depth + 1, max_depth
                )
                if result:
                    return result

        return None

    def _calculate_similarity(self, str1, str2):
        """
        Calculate similarity ratio between two strings using SequenceMatcher

        Args:
            str1: First string
            str2: Second string

        Returns:
            Float between 0.0 and 1.0 representing similarity
        """
        matcher = SequenceMatcher(None, str1.lower(), str2.lower())
        return matcher.ratio()

    def get_closest_match(self, user_answer, top_n=3):
        """
        Get the closest matching answers ranked by confidence

        Args:
            user_answer: User's answer
            top_n: Number of top matches to return

        Returns:
            List of tuples: [(answer, confidence), ...]
        """
        user_answer_clean = user_answer.lower().strip()
        matches = []

        for answer in self.acceptable_answers:
            confidence = self._calculate_similarity(user_answer_clean, answer.lower().strip())
            matches.append((answer, confidence))

        # Sort by confidence descending
        matches.sort(key=lambda x: x[1], reverse=True)

        # Filter by minimum tolerance and return top N
        return [m for m in matches[:top_n] if m[1] >= self.tolerance]
